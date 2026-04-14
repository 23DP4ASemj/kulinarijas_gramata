<?php

namespace App\Services;

use App\Models\Recipe;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class UserAchievementService
{
    private const TIER_LOCKED = 'locked';
    private const TIER_BRONZE = 'bronze';
    private const TIER_SILVER = 'silver';
    private const TIER_GOLD = 'gold';

    private const TIERS = [
        self::TIER_BRONZE => ['label' => 'Bronza', 'rank' => 1, 'color' => '#B97448', 'icon' => 'mdi-medal-outline'],
        self::TIER_SILVER => ['label' => 'Sudrabs', 'rank' => 2, 'color' => '#98A3B3', 'icon' => 'mdi-medal'],
        self::TIER_GOLD => ['label' => 'Zelts', 'rank' => 3, 'color' => '#D4A72C', 'icon' => 'mdi-trophy'],
    ];

    private const DEFINITIONS = [
        [
            'key' => 'first_steps_in_kitchen',
            'title' => 'Pirmie soļi virtuvē',
            'metric' => 'recipes_count',
            'description' => 'Publicē savu pirmo recepti un sāc savu kulinārijas ceļojumu.',
            'icon' => 'mdi-chef-hat',
            'tiers' => [
                self::TIER_BRONZE => 1,
                self::TIER_SILVER => 5,
                self::TIER_GOLD => 15,
            ],
        ],
        [
            'key' => 'active_recipe_author',
            'title' => 'Aktīvs recepšu autors',
            'metric' => 'recipes_count',
            'description' => 'Dalies ar arvien vairāk receptēm un kļūsti par pieredzējušu autoru.',
            'icon' => 'mdi-notebook-edit-outline',
            'tiers' => [
                self::TIER_BRONZE => 10,
                self::TIER_SILVER => 30,
                self::TIER_GOLD => 100,
            ],
        ],
        [
            'key' => 'beloved_author',
            'title' => 'Iecienīts autors',
            'metric' => 'total_favorites_received',
            'description' => 'Tavas receptes tiek pievienotas izlasei – lietotāji tās novērtē.',
            'icon' => 'mdi-heart-multiple',
            'tiers' => [
                self::TIER_BRONZE => 10,
                self::TIER_SILVER => 50,
                self::TIER_GOLD => 150,
            ],
        ],
        [
            'key' => 'growing_popularity',
            'title' => 'Augoša popularitāte',
            'metric' => 'followers_count',
            'description' => 'Iegūsti sekotājus un veido savu auditoriju.',
            'icon' => 'mdi-account-group-outline',
            'tiers' => [
                self::TIER_BRONZE => 5,
                self::TIER_SILVER => 25,
                self::TIER_GOLD => 100,
            ],
        ],
        [
            'key' => 'active_community_member',
            'title' => 'Aktīvs kopienas dalībnieks',
            'metric' => 'comments_count',
            'description' => 'Komentē, dalies viedokļos un iesaisties kopienā.',
            'icon' => 'mdi-comment-multiple-outline',
            'tiers' => [
                self::TIER_BRONZE => 5,
                self::TIER_SILVER => 20,
                self::TIER_GOLD => 80,
            ],
        ],
        [
            'key' => 'active_rater',
            'title' => 'Aktīvs vērtētājs',
            'metric' => 'ratings_given_count',
            'description' => 'Novērtē receptes un palīdz citiem atrast labāko.',
            'icon' => 'mdi-star-circle-outline',
            'tiers' => [
                self::TIER_BRONZE => 5,
                self::TIER_SILVER => 25,
                self::TIER_GOLD => 100,
            ],
        ],
        [
            'key' => 'recipe_collector',
            'title' => 'Recepšu kolekcionārs',
            'metric' => 'collections_count',
            'description' => 'Veido savas kolekcijas un saglabā iecienītākās receptes.',
            'icon' => 'mdi-bookmark-box-multiple-outline',
            'tiers' => [
                self::TIER_BRONZE => 1,
                self::TIER_SILVER => 3,
                self::TIER_GOLD => 7,
            ],
        ],
        [
            'key' => 'audience_favorite',
            'title' => 'Publikas favorīts',
            'metric' => 'average_rating',
            'description' => 'Tavas receptes saņem augstu novērtējumu no citiem lietotājiem.',
            'icon' => 'mdi-star-shooting-outline',
            'tiers' => [
                self::TIER_BRONZE => 3.5,
                self::TIER_SILVER => 4.2,
                self::TIER_GOLD => 4.7,
            ],
        ],
    ];

    public function __construct(
        private readonly UserMetricsService $userMetricsService
    ) {
    }

    public function getProfileData(User $user): array
    {
        $metrics = $this->userMetricsService->getForUser($user);
        $achievements = $this->buildAchievements($metrics);
        $states = $this->syncStates($user, $achievements);
        $notifications = $this->buildPendingNotifications($achievements, $states);
        $recentKeys = collect($notifications)
            ->mapWithKeys(fn (array $notification) => [$notification['achievement_key'] => true])
            ->all();

        return [
            'metrics' => $metrics,
            'summary' => $this->buildSummary($achievements),
            'achievements' => array_map(function (array $achievement) use ($recentKeys) {
                $achievement['is_recently_unlocked'] = (bool) ($recentKeys[$achievement['key']] ?? false);

                return $achievement;
            }, $achievements),
            'notifications' => $notifications,
        ];
    }

    public function initializeForNewUser(User $user): void
    {
        $existingKeys = $user->achievementStates()
            ->pluck('achievement_key')
            ->all();

        $rows = [];

        foreach (self::DEFINITIONS as $definition) {
            if (in_array($definition['key'], $existingKeys, true)) {
                continue;
            }

            $rows[] = [
                'user_id' => $user->id,
                'achievement_key' => $definition['key'],
                'current_tier' => self::TIER_LOCKED,
                'notified_tier' => self::TIER_LOCKED,
                'last_unlocked_at' => null,
                'last_notified_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($rows)) {
            UserAchievement::insert($rows);
        }
    }

    public function getOwnRecipes(User $user): array
    {
        return Recipe::listQuery((int) $user->id)
            ->where('user_id', $user->id)
            ->orderByDesc('recipes.created_at')
            ->get()
            ->map(fn (Recipe $recipe) => $recipe->toListArray())
            ->all();
    }

    public function markNotificationsAsRead(User $user): int
    {
        $states = $user->achievementStates()->get();
        $updated = 0;

        foreach ($states as $state) {
            if ($this->tierRank($state->current_tier) <= $this->tierRank($state->notified_tier)) {
                continue;
            }

            $state->notified_tier = $state->current_tier;
            $state->last_notified_at = now();
            $state->save();
            $updated++;
        }

        return $updated;
    }

    private function buildAchievements(array $metrics): array
    {
        return array_map(function (array $definition) use ($metrics) {
            $metricKey = $definition['metric'];
            $currentValue = (float) ($metrics[$metricKey] ?? 0);
            $currentTier = $this->resolveCurrentTier($definition['tiers'], $currentValue);
            $currentTierRank = $this->tierRank($currentTier);
            $nextTier = $this->resolveNextTier($definition['tiers'], $currentTier);
            $nextTarget = $nextTier ? (float) $definition['tiers'][$nextTier] : null;
            $progressPercentage = $this->calculateProgressPercentage($currentValue, $currentTier, $definition['tiers']);

            return [
                'key' => $definition['key'],
                'title' => $definition['title'],
                'description' => $definition['description'],
                'icon' => $definition['icon'],
                'metric' => $metricKey,
                'metric_value' => $this->normalizeMetricValue($currentValue),
                'metric_value_label' => $this->formatMetricValue($metricKey, $currentValue),
                'current_tier' => [
                    'key' => $currentTier,
                    'label' => $this->tierLabel($currentTier),
                    'rank' => $currentTierRank,
                    'color' => $this->tierColor($currentTier),
                    'icon' => $this->tierIcon($currentTier),
                ],
                'is_unlocked' => $currentTier !== self::TIER_LOCKED,
                'is_completed' => $currentTier === self::TIER_GOLD,
                'progress_percentage' => $progressPercentage,
                'progress_label' => $nextTarget !== null
                    ? $this->formatMetricValue($metricKey, $currentValue).' / '.$this->formatMetricValue($metricKey, $nextTarget)
                    : $this->formatMetricValue($metricKey, $currentValue),
                'next_target' => $nextTier ? [
                    'tier' => [
                        'key' => $nextTier,
                        'label' => $this->tierLabel($nextTier),
                        'rank' => $this->tierRank($nextTier),
                        'color' => $this->tierColor($nextTier),
                        'icon' => $this->tierIcon($nextTier),
                    ],
                    'value' => $this->normalizeMetricValue($nextTarget),
                    'value_label' => $this->formatMetricValue($metricKey, $nextTarget),
                    'remaining' => $this->normalizeMetricValue(max($nextTarget - $currentValue, 0)),
                    'remaining_label' => $this->formatMetricValue($metricKey, max($nextTarget - $currentValue, 0)),
                ] : null,
                'tiers' => array_map(function (string $tierKey, float|int $threshold) use ($currentTierRank, $metricKey) {
                    return [
                        'key' => $tierKey,
                        'label' => $this->tierLabel($tierKey),
                        'rank' => $this->tierRank($tierKey),
                        'threshold' => $this->normalizeMetricValue((float) $threshold),
                        'threshold_label' => $this->formatMetricValue($metricKey, (float) $threshold),
                        'color' => $this->tierColor($tierKey),
                        'icon' => $this->tierIcon($tierKey),
                        'is_reached' => $currentTierRank >= $this->tierRank($tierKey),
                    ];
                }, array_keys($definition['tiers']), array_values($definition['tiers'])),
            ];
        }, self::DEFINITIONS);
    }

    private function buildSummary(array $achievements): array
    {
        $totalCount = count($achievements);
        $unlockedCount = count(array_filter($achievements, fn (array $achievement) => $achievement['is_unlocked']));
        $goldCount = count(array_filter($achievements, fn (array $achievement) => $achievement['current_tier']['key'] === self::TIER_GOLD));

        return [
            'total_count' => $totalCount,
            'unlocked_count' => $unlockedCount,
            'locked_count' => max($totalCount - $unlockedCount, 0),
            'gold_count' => $goldCount,
            'completion_percentage' => $totalCount > 0 ? (int) round(($unlockedCount / $totalCount) * 100) : 0,
        ];
    }

    private function syncStates(User $user, array $achievements): Collection
    {
        $states = $user->achievementStates()
            ->get()
            ->keyBy('achievement_key');

        foreach ($achievements as $achievement) {
            $key = $achievement['key'];
            $computedTier = $achievement['current_tier']['key'];
            $computedRank = $this->tierRank($computedTier);
            /** @var UserAchievement|null $state */
            $state = $states->get($key);

            if (!$state) {
                $state = UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_key' => $key,
                    'current_tier' => $computedTier,
                    'notified_tier' => $computedTier,
                    'last_unlocked_at' => $computedRank > 0 ? now() : null,
                    'last_notified_at' => $computedRank > 0 ? now() : null,
                ]);
                $states->put($key, $state);

                continue;
            }

            $currentRank = $this->tierRank($state->current_tier);

            if ($computedRank > $currentRank) {
                $state->current_tier = $computedTier;
                $state->last_unlocked_at = now();
                $state->save();
                continue;
            }

            if ($computedRank < $currentRank) {
                $state->current_tier = $computedTier;
                $state->notified_tier = $computedTier;
                $state->last_notified_at = $computedRank > 0 ? now() : null;
                $state->save();
            }
        }

        return $states;
    }

    private function buildPendingNotifications(array $achievements, Collection $states): array
    {
        $notifications = [];
        $achievementMap = collect($achievements)->keyBy('key');

        foreach ($states as $key => $state) {
            /** @var UserAchievement $state */
            $achievement = $achievementMap->get($key);

            if (!$achievement) {
                continue;
            }

            $notifiedRank = $this->tierRank($state->notified_tier);
            $currentRank = $this->tierRank($state->current_tier);

            if ($currentRank <= $notifiedRank) {
                continue;
            }

            for ($rank = $notifiedRank + 1; $rank <= $currentRank; $rank++) {
                $tierKey = $this->tierKeyByRank($rank);
                if (!$tierKey) {
                    continue;
                }

                $notifications[] = [
                    'id' => $key.':'.$tierKey,
                    'achievement_key' => $key,
                    'title' => $achievement['title'],
                    'description' => $achievement['description'],
                    'icon' => $achievement['icon'],
                    'tier' => [
                        'key' => $tierKey,
                        'label' => $this->tierLabel($tierKey),
                        'rank' => $rank,
                        'color' => $this->tierColor($tierKey),
                        'icon' => $this->tierIcon($tierKey),
                    ],
                    'message' => $achievement['title'].' sasniedza '.$this->tierLabel($tierKey).' līmeni.',
                    'unlocked_at' => $this->serializeDate($state->last_unlocked_at),
                ];
            }
        }

        return $notifications;
    }

    private function resolveCurrentTier(array $tiers, float $currentValue): string
    {
        $tier = self::TIER_LOCKED;

        foreach ($tiers as $tierKey => $threshold) {
            if ($currentValue >= (float) $threshold) {
                $tier = $tierKey;
            }
        }

        return $tier;
    }

    private function resolveNextTier(array $tiers, string $currentTier): ?string
    {
        $tierOrder = array_keys($tiers);
        $currentRank = $this->tierRank($currentTier);

        foreach ($tierOrder as $tierKey) {
            if ($this->tierRank($tierKey) > $currentRank) {
                return $tierKey;
            }
        }

        return null;
    }

    private function calculateProgressPercentage(float $currentValue, string $currentTier, array $tiers): int
    {
        $nextTier = $this->resolveNextTier($tiers, $currentTier);

        if (!$nextTier) {
            return 100;
        }

        $target = (float) $tiers[$nextTier];

        if ($target <= 0) {
            return 0;
        }

        return (int) max(0, min(100, round(($currentValue / $target) * 100)));
    }

    private function tierRank(string $tier): int
    {
        return self::TIERS[$tier]['rank'] ?? 0;
    }

    private function tierLabel(string $tier): string
    {
        return self::TIERS[$tier]['label'] ?? 'Bloķēts';
    }

    private function tierColor(string $tier): string
    {
        return self::TIERS[$tier]['color'] ?? '#A0A7B4';
    }

    private function tierIcon(string $tier): string
    {
        return self::TIERS[$tier]['icon'] ?? 'mdi-lock-outline';
    }

    private function tierKeyByRank(int $rank): ?string
    {
        foreach (self::TIERS as $tierKey => $tier) {
            if ($tier['rank'] === $rank) {
                return $tierKey;
            }
        }

        return null;
    }

    private function normalizeMetricValue(float $value): int|float
    {
        return floor($value) === $value ? (int) $value : round($value, 1);
    }

    private function formatMetricValue(string $metric, float $value): string
    {
        if ($metric === 'average_rating') {
            return number_format($value, 1, '.', '');
        }

        $normalized = $this->normalizeMetricValue($value);

        return (string) $normalized;
    }

    private function serializeDate(CarbonInterface|string|null $value): ?string
    {
        if ($value instanceof CarbonInterface) {
            return $value->toISOString();
        }

        return is_string($value) ? $value : null;
    }
}

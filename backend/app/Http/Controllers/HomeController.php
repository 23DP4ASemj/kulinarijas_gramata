<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $viewerId = auth('sanctum')->id();
        $topLimit = (int) $request->query('top_limit', 5);
        $topLimit = max(1, min(10, $topLimit));
        $followingIds = $this->getFollowingIds($viewerId);

        $topRecipes = $this->getTopRecipes($viewerId, $topLimit);
        [$topAuthors, $recommendedAuthors] = $this->getTopAuthors($topLimit, $viewerId, $followingIds);

        return response()->json([
            'top_recipes' => RecipeListResource::collection($topRecipes)->resolve(),
            'top_authors' => $topAuthors,
            'recommended_authors' => $recommendedAuthors,
            'recipes' => [],
            'stats' => [
                'recipes_count' => Recipe::count(),
                'authors_count' => User::count(),
                'ratings_count' => Rating::count(),
            ],
        ]);
    }

    private function getFollowingIds(?int $viewerId): array
    {
        if (!$viewerId) {
            return [];
        }

        $viewer = User::find($viewerId);
        if (!$viewer) {
            return [];
        }

        return $viewer->following()
            ->pluck('users.id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function getTopRecipes(?int $viewerId, int $topLimit): Collection
    {
        $candidateLimit = max($topLimit * 8, 40);

        $topRecipes = Recipe::listQuery($viewerId)
            ->whereHas('ratings')
            ->orderByDesc('ratings_avg_value')
            ->orderByDesc('ratings_count')
            ->orderByDesc('favorites_count')
            ->orderByDesc('recipes.created_at')
            ->limit($candidateLimit)
            ->get()
            ->sort(function (Recipe $left, Recipe $right) {
                return $this->compareRecipeRank($left, $right);
            })
            ->take($topLimit)
            ->values();

        $missing = $topLimit - $topRecipes->count();
        if ($missing <= 0) {
            return $topRecipes;
        }

        $fallbackRecipes = Recipe::listQuery($viewerId)
            ->when(
                $topRecipes->isNotEmpty(),
                fn ($query) => $query->whereNotIn('recipes.id', $topRecipes->pluck('id')->all())
            )
            ->orderByDesc('favorites_count')
            ->orderByDesc('ratings_count')
            ->orderByDesc('recipes.created_at')
            ->limit($missing)
            ->get();

        return $topRecipes->concat($fallbackRecipes)->values();
    }

    private function getTopAuthors(int $topLimit, ?int $viewerId, array $followingIds): array
    {
        $candidateLimit = max($topLimit * 8, 40);

        $authorPool = User::query()
            ->select('id', 'name')
            ->withCount(['recipes', 'followers'])
            ->withAvg('recipeRatings as avg_rating', 'value')
            ->whereHas('recipes')
            ->orderByDesc('recipes_count')
            ->orderByDesc('followers_count')
            ->orderBy('name')
            ->limit($candidateLimit)
            ->get()
            ->map(function (User $author) use ($viewerId, $followingIds) {
                $authorId = (int) $author->id;

                return [
                    'id' => $authorId,
                    'name' => $author->name,
                    'recipes_count' => (int) ($author->recipes_count ?? 0),
                    'avg_rating' => round((float) ($author->avg_rating ?? 0), 1),
                    'followers_count' => (int) ($author->followers_count ?? 0),
                    'is_following' => in_array($authorId, $followingIds, true),
                    'is_me' => $viewerId ? $authorId === (int) $viewerId : false,
                ];
            })
            ->sort(function (array $left, array $right) {
                return $this->compareAuthorRank($left, $right);
            })
            ->values();

        $topAuthors = $authorPool
            ->take($topLimit)
            ->values()
            ->all();

        $recommendedAuthors = $authorPool
            ->reject(fn (array $author) => $author['is_me'] || $author['is_following'])
            ->take(6)
            ->values()
            ->all();

        return [$topAuthors, $recommendedAuthors];
    }

    private function compareRecipeRank(Recipe $left, Recipe $right): int
    {
        $scoreCompare = $this->compareNumbers($this->recipeRankScore($right), $this->recipeRankScore($left));
        if ($scoreCompare !== 0) {
            return $scoreCompare;
        }

        $ratingCountCompare = $this->compareNumbers((int) ($right->ratings_count ?? 0), (int) ($left->ratings_count ?? 0));
        if ($ratingCountCompare !== 0) {
            return $ratingCountCompare;
        }

        $favoriteCountCompare = $this->compareNumbers((int) ($right->favorites_count ?? 0), (int) ($left->favorites_count ?? 0));
        if ($favoriteCountCompare !== 0) {
            return $favoriteCountCompare;
        }

        return $this->compareNumbers($right->created_at?->getTimestamp() ?? 0, $left->created_at?->getTimestamp() ?? 0);
    }

    private function compareAuthorRank(array $left, array $right): int
    {
        $scoreCompare = $this->compareNumbers($this->authorRankScore($right), $this->authorRankScore($left));
        if ($scoreCompare !== 0) {
            return $scoreCompare;
        }

        $recipeCountCompare = $this->compareNumbers((int) $right['recipes_count'], (int) $left['recipes_count']);
        if ($recipeCountCompare !== 0) {
            return $recipeCountCompare;
        }

        $followersCompare = $this->compareNumbers((int) $right['followers_count'], (int) $left['followers_count']);
        if ($followersCompare !== 0) {
            return $followersCompare;
        }

        return strcmp((string) $left['name'], (string) $right['name']);
    }

    private function recipeRankScore(Recipe $recipe): float
    {
        $avgRating = (float) ($recipe->ratings_avg_value ?? 0);
        $ratingsCount = min((int) ($recipe->ratings_count ?? 0), 50);
        $favoritesCount = min((int) ($recipe->favorites_count ?? 0), 50);

        return ($avgRating * 1000) + ($ratingsCount * 24) + ($favoritesCount * 16);
    }

    private function authorRankScore(array $author): float
    {
        $avgRating = (float) ($author['avg_rating'] ?? 0);
        $recipesCount = min((int) ($author['recipes_count'] ?? 0), 50);
        $followersCount = min((int) ($author['followers_count'] ?? 0), 100);

        return ($avgRating * 1000) + ($recipesCount * 36) + ($followersCount * 8);
    }

    private function compareNumbers(int|float $left, int|float $right): int
    {
        return $left <=> $right;
    }
}

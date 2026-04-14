<?php

namespace App\Support;

final class RecipeCategoryCatalog
{
    public const FALLBACK = 'Citi';

    public static function canonical(): array
    {
        return [
            'Brokastis',
            'Pusdienas',
            'Vakariņas',
            'Deserti',
            'Dzērieni',
            'Uzkodas',
            'Salāti',
            'Zupas',
            'Veģetārie ēdieni',
            self::FALLBACK,
        ];
    }

    public static function aliases(): array
    {
        return [
            'Breakfast' => 'Brokastis',
            'Lunch' => 'Pusdienas',
            'Dinner' => 'Vakariņas',
            'Dessert' => 'Deserti',
            'Drinks' => 'Dzērieni',
            'Snacks' => 'Uzkodas',
            'Salads' => 'Salāti',
            'Soups' => 'Zupas',
            'Vegetarian' => 'Veģetārie ēdieni',
            'Other' => self::FALLBACK,
            'VakariÅ†as' => 'Vakariņas',
            'VakariÃ…â€ as' => 'Vakariņas',
            'DzÄ“rieni' => 'Dzērieni',
            'DzÃ„â€œrieni' => 'Dzērieni',
        ];
    }

    public static function normalize(?string $name): ?string
    {
        $trimmed = trim((string) $name);
        if ($trimmed === '') {
            return null;
        }

        $lookup = self::lookup();

        if (isset($lookup[$trimmed])) {
            return $lookup[$trimmed];
        }

        return $lookup[self::lower($trimmed)] ?? null;
    }

    public static function normalizeOrFallback(?string $name): string
    {
        return self::normalize($name) ?? self::FALLBACK;
    }

    public static function orderIndex(?string $name): int
    {
        static $indexes = null;

        if ($indexes === null) {
            $indexes = [];
            foreach (self::canonical() as $index => $item) {
                $indexes[$item] = $index;
            }
        }

        return $indexes[$name] ?? count(self::canonical());
    }

    private static function lookup(): array
    {
        static $lookup = null;

        if ($lookup !== null) {
            return $lookup;
        }

        $lookup = [];

        foreach (self::canonical() as $name) {
            $lookup[$name] = $name;
            $lookup[self::lower($name)] = $name;
        }

        foreach (self::aliases() as $alias => $canonical) {
            $lookup[$alias] = $canonical;
            $lookup[self::lower($alias)] = $canonical;
        }

        return $lookup;
    }

    private static function lower(string $value): string
    {
        return function_exists('mb_strtolower')
            ? mb_strtolower($value, 'UTF-8')
            : strtolower($value);
    }
}

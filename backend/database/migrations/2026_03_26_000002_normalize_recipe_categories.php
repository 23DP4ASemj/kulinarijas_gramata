<?php

use App\Support\RecipeCategoryCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        foreach (RecipeCategoryCatalog::canonical() as $name) {
            DB::table('categories')->updateOrInsert(['name' => $name], ['name' => $name]);
        }

        $canonicalIds = DB::table('categories')
            ->whereIn('name', RecipeCategoryCatalog::canonical())
            ->pluck('id', 'name')
            ->all();

        $fallbackId = $canonicalIds[RecipeCategoryCatalog::FALLBACK] ?? null;

        $categories = DB::table('categories')
            ->select(['id', 'name'])
            ->orderBy('id')
            ->get();

        foreach ($categories as $category) {
            $normalized = RecipeCategoryCatalog::normalize($category->name) ?? RecipeCategoryCatalog::FALLBACK;
            $targetId = $canonicalIds[$normalized] ?? $fallbackId;

            if (!$targetId || (int) $category->id === (int) $targetId) {
                continue;
            }

            DB::table('recipes')
                ->where('category_id', $category->id)
                ->update(['category_id' => $targetId]);

            DB::table('categories')
                ->where('id', $category->id)
                ->delete();
        }
    }

    public function down(): void
    {
        // Irreversible data normalization. Kept intentionally empty.
    }
};

<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Recipe;
use App\Models\User;

class CollectionService
{
    public function create(User $user, array $data): Collection
    {
        return Collection::create([
            'name' => $data['name'],
            'user_id' => $user->id,
        ]);
    }

    public function update(Collection $collection, array $data): Collection
    {
        $collection->name = $data['name'];
        $collection->save();

        return $collection;
    }

    public function delete(Collection $collection): void
    {
        $collection->delete();
    }

    public function addRecipe(Collection $collection, Recipe $recipe): void
    {
        $collection->recipes()->syncWithoutDetaching([$recipe->id]);
    }

    public function removeRecipe(Collection $collection, Recipe $recipe): void
    {
        $collection->recipes()->detach($recipe->id);
    }
}

<?php

namespace App\Policies;

use App\Models\Recipe;
use App\Models\User;
use App\Policies\Concerns\AdminOrOwner;

class RecipePolicy
{
    use AdminOrOwner;

    public function update(User $user, Recipe $recipe): bool
    {
        return $this->adminOrOwner($user, $recipe->user_id);
    }

    public function delete(User $user, Recipe $recipe): bool
    {
        return $this->adminOrOwner($user, $recipe->user_id);
    }
}

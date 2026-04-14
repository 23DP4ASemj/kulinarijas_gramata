<?php

namespace App\Policies\Concerns;

use App\Models\User;

trait AdminOrOwner
{
    protected function adminOrOwner(User $user, int $resourceUserId): bool
    {
        return $user->isAdmin() || $user->id === $resourceUserId;
    }
}

<?php

namespace App\Policies;

use App\Models\Rating;
use App\Models\User;
use App\Policies\Concerns\AdminOrOwner;

class RatingPolicy
{
    use AdminOrOwner;

    public function update(User $user, Rating $rating): bool
    {
        return $this->adminOrOwner($user, $rating->user_id);
    }

    public function delete(User $user, Rating $rating): bool
    {
        return $this->adminOrOwner($user, $rating->user_id);
    }
}

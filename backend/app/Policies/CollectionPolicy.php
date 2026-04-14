<?php

namespace App\Policies;

use App\Models\Collection;
use App\Models\User;
use App\Policies\Concerns\AdminOrOwner;

class CollectionPolicy
{
    use AdminOrOwner;

    public function update(User $user, Collection $collection): bool
    {
        return $this->adminOrOwner($user, $collection->user_id);
    }

    public function delete(User $user, Collection $collection): bool
    {
        return $this->adminOrOwner($user, $collection->user_id);
    }
}

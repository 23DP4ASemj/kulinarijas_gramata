<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use App\Policies\Concerns\AdminOrOwner;

class CommentPolicy
{
    use AdminOrOwner;

    public function update(User $user, Comment $comment): bool
    {
        return $this->adminOrOwner($user, $comment->user_id);
    }

    public function delete(User $user, Comment $comment): bool
    {
        return $this->adminOrOwner($user, $comment->user_id);
    }
}

<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class CommentService
{
    public function paginateForRecipe(Recipe $recipe, int $perPage = 10): LengthAwarePaginator
    {
        $perPage = max(1, min(50, $perPage));

        return Comment::query()
            ->where('recipe_id', $recipe->id)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function create(User $user, Recipe $recipe, array $data): Comment
    {
        $comment = Comment::create([
            'user_id' => $user->id,
            'recipe_id' => $recipe->id,
            'text' => $data['text'],
        ]);

        return $comment->load('user:id,name');
    }

    public function update(Comment $comment, array $data): Comment
    {
        $comment->text = $data['text'];
        $comment->save();

        return $comment->load('user:id,name');
    }

    public function delete(Comment $comment): void
    {
        $comment->delete();
    }
}

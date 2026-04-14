<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Recipe;
use App\Services\CommentService;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request, Recipe $recipe, CommentService $commentService)
    {
        $perPage = (int) $request->query('per_page', 10);
        $paginator = $commentService->paginateForRecipe($recipe, $perPage);

        return CommentResource::collection($paginator);
    }

    public function store(StoreCommentRequest $request, Recipe $recipe, CommentService $commentService)
    {
        $comment = $commentService->create($request->user(), $recipe, $request->validated());

        return response()->json([
            'comment' => new CommentResource($comment),
        ], 201);
    }

    public function update(UpdateCommentRequest $request, Comment $comment, CommentService $commentService)
    {
        $this->authorize('update', $comment);

        $comment = $commentService->update($comment, $request->validated());

        return response()->json([
            'comment' => new CommentResource($comment),
        ]);
    }

    public function destroy(Comment $comment, CommentService $commentService)
    {
        $this->authorize('delete', $comment);

        $commentService->delete($comment);

        return response()->json(['message' => 'Comment deleted.']);
    }
}

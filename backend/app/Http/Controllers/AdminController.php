<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\CommentResource;
use App\Http\Resources\UserResource;
use App\Models\Comment;
use App\Models\User;
use App\Services\AdminService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function analytics(AdminService $adminService)
    {
        return response()->json([
            'stats' => $adminService->analytics(),
        ]);
    }

    public function users(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $query = User::query()
            ->withEffectiveRoleFlags()
            ->orderByDesc('created_at');

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', '%'.$q.'%')
                    ->orWhere('email', 'like', '%'.$q.'%');
            });
        }

        $paginator = $query->paginate($perPage);

        return UserResource::collection($paginator);
    }

    public function updateUserRole(UpdateUserRoleRequest $request, User $user)
    {
        $nextRole = $request->validated()['role'];

        if ($user->isAdmin() && $nextRole !== User::ROLE_ADMIN && User::where('role', User::ROLE_ADMIN)->count() <= 1) {
            return response()->json([
                'message' => 'Sistēmā ir jāpaliek vismaz vienam administratoram.',
            ], 422);
        }

        if ($nextRole === User::ROLE_USER && $user->hasPublishedContent()) {
            return response()->json([
                'message' => 'Lietotājs ar publicētu saturu automātiski paliek autora lomā.',
            ], 422);
        }

        $user->role = $nextRole;
        $user->save();

        return response()->json(['user' => new UserResource($user)]);
    }

    public function comments(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $query = Comment::query()->with('user:id,name')->orderByDesc('created_at');

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where('text', 'like', '%'.$q.'%');
        }

        $paginator = $query->paginate($perPage);

        return CommentResource::collection($paginator);
    }

    public function deleteComment(Comment $comment)
    {
        $comment->delete();

        return response()->json(['message' => 'Comment removed.']);
    }
}

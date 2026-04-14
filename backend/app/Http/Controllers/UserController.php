<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Http\Resources\UserResource;
use App\Models\Recipe;
use App\Models\User;
use App\Services\UserMetricsService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(int $id, UserMetricsService $userMetricsService)
    {
        $user = User::findOrFail($id);
        $viewerId = auth('sanctum')->id();
        $stats = $userMetricsService->getForUser($user);

        $followersCount = $user->followers()->count();
        $isFollowing = false;
        if ($viewerId) {
            $isFollowing = $user->followers()->where('follower_id', $viewerId)->exists();
        }

        $recipes = Recipe::listQuery($viewerId)
            ->where('user_id', $id)
            ->orderByDesc('recipes.created_at')
            ->get()
            ->map(function (Recipe $recipe) {
                return (new RecipeListResource($recipe))->toArray(request());
            });

        $userPayload = (new UserResource($user))->resolve(request());
        $userPayload['recipes_count'] = (int) ($stats['recipes_count'] ?? 0);
        $userPayload['average_rating_across_recipes'] = (float) ($stats['average_rating'] ?? 0);
        $userPayload['followers_count'] = (int) $followersCount;
        $userPayload['is_following'] = (bool) $isFollowing;

        return response()->json([
            'user' => $userPayload,
            'recipes_count' => (int) ($stats['recipes_count'] ?? 0),
            'average_rating_across_recipes' => (float) ($stats['average_rating'] ?? 0),
            'followers_count' => (int) $followersCount,
            'is_following' => (bool) $isFollowing,
            'recipes' => $recipes,
        ]);
    }

    public function subscriptions(Request $request)
    {
        $user = $request->user();

        $following = $user->following()
            ->withEffectiveRoleFlags()
            ->withCount(['recipes', 'followers'])
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.role', 'users.email'])
            ->filter(fn (User $candidate) => $candidate->isAuthor() || $candidate->isAdmin())
            ->values();

        $followingIds = $following->pluck('id')->all();

        $suggested = User::query()
            ->withEffectiveRoleFlags()
            ->where('id', '!=', $user->id)
            ->when(!empty($followingIds), fn ($q) => $q->whereNotIn('id', $followingIds))
            ->withCount(['recipes', 'followers', 'blogPosts'])
            ->orderByDesc('recipes_count')
            ->orderByDesc('blog_posts_count')
            ->orderByDesc('followers_count')
            ->limit(24)
            ->get(['id', 'name', 'role', 'email'])
            ->filter(fn (User $candidate) => $candidate->hasPublishedContent() || $candidate->isAuthor() || $candidate->isAdmin())
            ->take(8)
            ->values();

        return response()->json([
            'following' => $following->map(fn (User $author) => [
                'id' => (int) $author->id,
                'name' => $author->name,
                'role' => $author->effective_role,
                'email' => $author->email,
                'recipes_count' => (int) ($author->recipes_count ?? 0),
                'followers_count' => (int) ($author->followers_count ?? 0),
                'is_following' => true,
            ])->values(),
            'suggested' => $suggested->map(fn (User $author) => [
                'id' => (int) $author->id,
                'name' => $author->name,
                'role' => $author->effective_role,
                'email' => $author->email,
                'recipes_count' => (int) ($author->recipes_count ?? 0),
                'followers_count' => (int) ($author->followers_count ?? 0),
                'is_following' => false,
            ])->values(),
        ]);
    }

    public function subscriptionsFeed(Request $request)
    {
        $user = $request->user();
        $viewerId = (int) $user->id;
        $perPage = (int) $request->query('per_page', 6);
        $perPage = max(1, min(20, $perPage));

        $followingIds = $user->following()->pluck('users.id');

        if ($followingIds->isEmpty()) {
            $empty = Recipe::query()->whereRaw('1 = 0')->paginate($perPage);
            return RecipeListResource::collection($empty);
        }

        $paginator = Recipe::listQuery($viewerId)
            ->whereIn('recipes.user_id', $followingIds->all())
            ->orderByDesc('recipes.created_at')
            ->paginate($perPage);

        return RecipeListResource::collection($paginator);
    }

    public function follow(int $id)
    {
        $user = User::findOrFail($id);
        $followerId = auth('sanctum')->id();

        if ($followerId === $user->id) {
            return response()->json(['message' => 'Nevar sekot pašam sev.'], 422);
        }

        $user->followers()->syncWithoutDetaching([$followerId]);

        $followersCount = $user->followers()->count();

        return response()->json([
            'is_following' => true,
            'followers_count' => (int) $followersCount,
        ]);
    }

    public function unfollow(int $id)
    {
        $user = User::findOrFail($id);
        $followerId = auth('sanctum')->id();

        if ($followerId === $user->id) {
            return response()->json(['message' => 'Nevar sekot pašam sev.'], 422);
        }

        $user->followers()->detach($followerId);

        $followersCount = $user->followers()->count();

        return response()->json([
            'is_following' => false,
            'followers_count' => (int) $followersCount,
        ]);
    }
}

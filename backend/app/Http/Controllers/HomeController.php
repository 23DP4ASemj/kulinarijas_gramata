<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Rating;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $viewerId = auth('sanctum')->id();
        $topLimit = (int) $request->query('top_limit', 5);
        $topLimit = max(1, min(10, $topLimit));

        $topRecipes = Recipe::listQuery($viewerId)
            ->orderByDesc(DB::raw('COALESCE(ratings_avg_value, 0)'))
            ->orderByDesc('favorites_count')
            ->orderByDesc('ratings_count')
            ->orderByDesc('recipes.created_at')
            ->limit($topLimit)
            ->get();

        $authorStats = DB::table('recipes')
            ->leftJoin('ratings', 'ratings.recipe_id', '=', 'recipes.id')
            ->select(
                'recipes.user_id',
                DB::raw('COUNT(DISTINCT recipes.id) as recipes_count'),
                DB::raw('COALESCE(AVG(ratings.value), 0) as avg_rating')
            )
            ->groupBy('recipes.user_id');

        $followerStats = DB::table('user_follows')
            ->select(
                'following_id',
                DB::raw('COUNT(*) as followers_count')
            )
            ->groupBy('following_id');

        $followingIds = $viewerId
            ? DB::table('user_follows')
                ->where('follower_id', $viewerId)
                ->pluck('following_id')
                ->map(fn ($id) => (int) $id)
                ->all()
            : [];

        $authorPool = User::query()
            ->joinSub($authorStats, 'author_stats', function ($join) {
                $join->on('author_stats.user_id', '=', 'users.id');
            })
            ->leftJoinSub($followerStats, 'follower_stats', function ($join) {
                $join->on('follower_stats.following_id', '=', 'users.id');
            })
            ->select(
                'users.id',
                'users.name',
                DB::raw('author_stats.recipes_count as recipes_count'),
                DB::raw('author_stats.avg_rating as avg_rating'),
                DB::raw('COALESCE(follower_stats.followers_count, 0) as followers_count')
            )
            ->orderByDesc('avg_rating')
            ->orderByDesc('recipes_count')
            ->orderByDesc('followers_count')
            ->orderBy('users.name')
            ->limit(max($topLimit, 12))
            ->get()
            ->map(function ($author) {
                return [
                    'id' => (int) $author->id,
                    'name' => $author->name,
                    'recipes_count' => (int) $author->recipes_count,
                    'avg_rating' => round((float) ($author->avg_rating ?? 0), 1),
                    'followers_count' => (int) ($author->followers_count ?? 0),
                ];
            })
            ->values();

        $decorateAuthor = function (array $author) use ($viewerId, $followingIds): array {
            $authorId = (int) $author['id'];

            return [
                ...$author,
                'is_following' => in_array($authorId, $followingIds, true),
                'is_me' => $viewerId ? $authorId === (int) $viewerId : false,
            ];
        };

        $topAuthors = $authorPool
            ->map($decorateAuthor)
            ->take($topLimit)
            ->values();

        return response()->json([
            'top_recipes' => RecipeListResource::collection($topRecipes)->resolve(),
            'top_authors' => $topAuthors,
            'stats' => [
                'recipes_count' => Recipe::count(),
                'authors_count' => User::count(),
                'ratings_count' => Rating::count(),
            ],
        ]);
    }
}
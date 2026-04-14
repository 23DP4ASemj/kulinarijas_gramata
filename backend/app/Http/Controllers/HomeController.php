<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecipeListResource;
use App\Models\Recipe;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $weight = 0.1;
        $viewerId = auth('sanctum')->id();
        $topLimit = (int) $request->query('top_limit', 5);
        $topLimit = max(1, min(10, $topLimit));

        $topRecipes = Recipe::listQuery($viewerId)
            ->orderByRaw('(COALESCE(ratings_avg_value, 0) + (ratings_count * ?)) desc', [$weight])
            ->limit($topLimit)
            ->get();

        $topAuthorsQuery = User::query()
            ->leftJoin('recipes', 'users.id', '=', 'recipes.user_id')
            ->leftJoin('ratings', 'recipes.id', '=', 'ratings.recipe_id')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(DISTINCT recipes.id) as recipes_count'),
                DB::raw('COALESCE(AVG(ratings.value), 0) as avg_rating')
            )
            ->selectSub(
                DB::table('user_follows')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('following_id', 'users.id'),
                'followers_count'
            )
            ->groupBy('users.id', 'users.name')
            ->havingRaw('COUNT(DISTINCT recipes.id) > 0')
            ->orderByDesc('recipes_count')
            ->orderByDesc('avg_rating')
            ->limit($topLimit);

        if ($viewerId) {
            $topAuthorsQuery->selectSub(
                DB::table('user_follows')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('following_id', 'users.id')
                    ->where('follower_id', $viewerId),
                'is_following'
            );
        }

        $topAuthors = $topAuthorsQuery
            ->get()
            ->map(function ($author) use ($viewerId) {
                return [
                    'id' => (int) $author->id,
                    'name' => $author->name,
                    'recipes_count' => (int) $author->recipes_count,
                    'avg_rating' => (float) $author->avg_rating,
                    'followers_count' => (int) ($author->followers_count ?? 0),
                    'is_following' => (bool) ($author->is_following ?? false),
                    'is_me' => $viewerId ? ((int) $viewerId === (int) $author->id) : false,
                ];
            });

        $perPage = 9;
        $recipesPaginator = Recipe::listQuery($viewerId)
            ->orderByDesc('recipes.created_at')
            ->paginate($perPage);

        return response()->json([
            'top_recipes' => RecipeListResource::collection($topRecipes)->resolve(),
            'top_authors' => $topAuthors,
            'recommended_authors' => $topAuthors->take(6)->values(),
            'recipes' => RecipeListResource::collection($recipesPaginator->getCollection())->resolve(),
            'stats' => [
                'recipes_count' => Recipe::count(),
                'authors_count' => User::query()
                    ->where(function ($query) {
                        $query->whereIn('role', [User::ROLE_AUTHOR, User::ROLE_ADMIN])
                            ->orWhereHas('recipes')
                            ->orWhereHas('blogPosts');
                    })
                    ->count(),
                'ratings_count' => Rating::count(),
            ],
        ]);
    }
}

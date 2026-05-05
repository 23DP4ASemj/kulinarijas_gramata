<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\NutritionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

Route::get('/home', [HomeController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{blogPost}', [BlogPostController::class, 'show']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/recipes/{recipe}/similar', [RecipeController::class, 'similar']);

// Маршруты для расчета калорийности
Route::prefix('nutrition')->group(function () {
    Route::get('/search', [NutritionController::class, 'searchFood']);
    Route::post('/calculate-ingredient', [NutritionController::class, 'calculateIngredient']);
    Route::post('/calculate-recipe', [NutritionController::class, 'calculateRecipe']);
});

Route::apiResource('recipes', RecipeController::class)->only(['index', 'show']);
Route::get('/recipes/{recipe}/comments', [CommentController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:6,1');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/achievements/notifications', [ProfileController::class, 'achievementNotifications']);
    Route::post('/profile/achievements/notifications/read', [ProfileController::class, 'markAchievementNotificationsAsRead']);

    Route::get('/subscriptions', [UserController::class, 'subscriptions']);
    Route::get('/subscriptions/feed', [UserController::class, 'subscriptionsFeed']);
    Route::post('/users/{id}/follow', [UserController::class, 'follow']);
    Route::delete('/users/{id}/follow', [UserController::class, 'unfollow']);

    Route::post('/recipes', [RecipeController::class, 'store'])
        ->middleware(['role:user,author,admin']);
    Route::patch('/recipes/{recipe}', [RecipeController::class, 'update'])
        ->middleware(['role:author,admin']);
    Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy'])
        ->middleware(['role:author,admin']);

    Route::post('/recipes/{recipe}/comments', [CommentController::class, 'store']);
    Route::patch('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::put('/recipes/{recipe}/rating', [RatingController::class, 'store']);
    Route::delete('/recipes/{recipe}/rating', [RatingController::class, 'destroy']);

    Route::post('/recipes/{recipe}/favorite', [FavoriteController::class, 'store']);
    Route::delete('/recipes/{recipe}/favorite', [FavoriteController::class, 'destroy']);
    Route::post('/blog-posts', [BlogPostController::class, 'store'])
        ->middleware(['role:user,author,admin']);

    Route::apiResource('collections', CollectionController::class);
    Route::post('/collections/{collection}/recipes/{recipe}', [CollectionController::class, 'addRecipe']);
    Route::delete('/collections/{collection}/recipes/{recipe}', [CollectionController::class, 'removeRecipe']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole']);
        Route::get('/comments', [AdminController::class, 'comments']);
        Route::delete('/comments/{comment}', [AdminController::class, 'deleteComment']);
    });
});

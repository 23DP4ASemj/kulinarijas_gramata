<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\RecipeCategoryCatalog;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->whereIn('name', RecipeCategoryCatalog::canonical())
            ->get()
            ->sortBy(fn (Category $category) => RecipeCategoryCatalog::orderIndex($category->name))
            ->values();

        return CategoryResource::collection($categories);
    }
}

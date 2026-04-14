<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Support\RecipeCategoryCatalog;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach (RecipeCategoryCatalog::canonical() as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}

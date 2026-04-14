<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use Illuminate\Database\Seeder;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Eggs',
            'Milk',
            'Butter',
            'Flour',
            'Sugar',
            'Salt',
            'Black Pepper',
            'Olive Oil',
            'Garlic',
            'Onion',
            'Tomato',
            'Chicken',
            'Beef',
            'Rice',
            'Pasta',
            'Cheese',
            'Lemon',
            'Basil',
        ];

        foreach ($names as $name) {
            Ingredient::firstOrCreate(['name' => $name]);
        }
    }
}

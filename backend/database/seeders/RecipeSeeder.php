<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Recipe;
use App\Models\User;
use App\Support\RecipeCategoryCatalog;
use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'author@demo.lv')->first() ?? User::first();
        if (!$author) {
            return;
        }

        $categories = Category::pluck('id', 'name')->toArray();

        $recipes = [
            [
                'title' => 'Aukstā biešu zupa',
                'description' => 'Klasiska vasaras zupa ar kefīru, bietēm, gurķiem un dillēm.',
                'category' => 'Pusdienas',
                'prep_time_minutes' => 25,
                'difficulty' => 'Easy',
                'image_url' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Vārītas bietes', 'amount' => '300', 'unit' => 'g'],
                    ['name' => 'Kefīrs', 'amount' => '700', 'unit' => 'ml'],
                    ['name' => 'Gurķis', 'amount' => '1', 'unit' => 'gab'],
                    ['name' => 'Dilles', 'amount' => '20', 'unit' => 'g'],
                ],
                'steps' => [
                    'Sarīvē bietes un smalki sakapā gurķi un dilles.',
                    'Lielā bļodā sajauc kefīru ar bietēm un gurķi.',
                    'Pievieno sāli pēc garšas un iemaisi dilles.',
                    'Ievieto zupu ledusskapī uz 20 minūtēm, lai garšas savelkas.',
                    'Pasniedz aukstu ar vārītu olu vai kartupeļiem.',
                ],
            ],
            [
                'title' => 'Kartupeļu pankūkas',
                'description' => 'Zeltaini kraukšķīgas pankūkas no rīvētiem kartupeļiem.',
                'category' => 'Vakariņas',
                'prep_time_minutes' => 35,
                'difficulty' => 'Easy',
                'image_url' => 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Kartupeļi', 'amount' => '700', 'unit' => 'g'],
                    ['name' => 'Ola', 'amount' => '1', 'unit' => 'gab'],
                    ['name' => 'Milti', 'amount' => '2', 'unit' => 'ēdk'],
                    ['name' => 'Sāls', 'amount' => '1', 'unit' => 'tējk'],
                ],
                'steps' => [
                    'Nomizo kartupeļus un sarīvē tos uz smalkās rīves.',
                    'Nospied lieko šķidrumu un pievieno olu, miltus un sāli.',
                    'Sakarsē pannu ar nelielu eļļas daudzumu.',
                    'Ar karoti liec mīklu pannā un veido plakanas pankūkas.',
                    'Cep no abām pusēm līdz zeltaini brūnas.',
                    'Pasniedz ar skābo krējumu vai ķiploku mērci.',
                ],
            ],
            [
                'title' => 'Biezpiena plācenīši',
                'description' => 'Mīksti brokastu plācenīši ar vaniļu un ogām.',
                'category' => 'Brokastis',
                'prep_time_minutes' => 20,
                'difficulty' => 'Easy',
                'image_url' => 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Biezpiens', 'amount' => '400', 'unit' => 'g'],
                    ['name' => 'Ola', 'amount' => '1', 'unit' => 'gab'],
                    ['name' => 'Cukurs', 'amount' => '2', 'unit' => 'ēdk'],
                    ['name' => 'Milti', 'amount' => '4', 'unit' => 'ēdk'],
                ],
                'steps' => [
                    'Bļodā samīci biezpienu, pievieno olu un cukuru.',
                    'Iemaisi miltus, līdz masa kļūst viendabīga un viegli formējama.',
                    'Ar rokām izveido nelielus plācenīšus.',
                    'Cep plācenīšus pannā uz vidējas uguns 2–3 minūtes no katras puses.',
                    'Pasniedz ar medu, ievārījumu vai svaigām ogām.',
                ],
            ],
            [
                'title' => 'Medus kūka glāzē',
                'description' => 'Ātra deserta versija ar medus biskvītu un krēmu.',
                'category' => 'Deserti',
                'prep_time_minutes' => 30,
                'difficulty' => 'Medium',
                'image_url' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Skābais krējums', 'amount' => '300', 'unit' => 'g'],
                    ['name' => 'Medus', 'amount' => '3', 'unit' => 'ēdk'],
                    ['name' => 'Milti', 'amount' => '220', 'unit' => 'g'],
                    ['name' => 'Cukurs', 'amount' => '100', 'unit' => 'g'],
                ],
                'steps' => [
                    'Sagatavo vienkāršu medus biskvīta mīklu un izcep plānā kārtā.',
                    'Atdzesē biskvītu un sadrupini to mazās drupačās.',
                    'Sakuļ skābo krējumu ar medu līdz gludam krēmam.',
                    'Glāzēs kārto drupačas un krēmu vairākās kārtās.',
                    'Atdzesē desertu vismaz 30 minūtes pirms pasniegšanas.',
                ],
            ],
            [
                'title' => 'Cepta vista ar dārzeņiem',
                'description' => 'Sulīga vista cepeškrāsnī ar burkāniem un papriku.',
                'category' => 'Vakariņas',
                'prep_time_minutes' => 50,
                'difficulty' => 'Medium',
                'image_url' => 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Vistas fileja', 'amount' => '600', 'unit' => 'g'],
                    ['name' => 'Paprika', 'amount' => '1', 'unit' => 'gab'],
                    ['name' => 'Burkāni', 'amount' => '2', 'unit' => 'gab'],
                    ['name' => 'Olīveļļa', 'amount' => '2', 'unit' => 'ēdk'],
                ],
                'steps' => [
                    'Sagriez vistu un dārzeņus vienāda lieluma gabalos.',
                    'Sajauc visu ar eļļu, sāli, pipariem un iecienītām garšvielām.',
                    'Izklāj masu cepamtraukā vienā kārtā.',
                    'Cep 200°C temperatūrā 30–35 minūtes, līdz vista gatava.',
                    'Pirms pasniegšanas ļauj ēdienam 5 minūtes atpūsties.',
                ],
            ],
            [
                'title' => 'Ogu smūtijs',
                'description' => 'Atsvaidzinošs dzēriens ar saldētām ogām un banānu.',
                'category' => 'Dzērieni',
                'prep_time_minutes' => 10,
                'difficulty' => 'Easy',
                'image_url' => 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=1200&q=80',
                'ingredients' => [
                    ['name' => 'Banāns', 'amount' => '1', 'unit' => 'gab'],
                    ['name' => 'Ogas', 'amount' => '200', 'unit' => 'g'],
                    ['name' => 'Piens', 'amount' => '250', 'unit' => 'ml'],
                    ['name' => 'Medus', 'amount' => '1', 'unit' => 'ēdk'],
                ],
                'steps' => [
                    'Nomizo banānu un sagriez to gabaliņos.',
                    'Blenderī liec ogas, banānu, pienu un medu.',
                    'Blendē 30–40 sekundes līdz viendabīgai konsistencei.',
                    'Ja nepieciešams, pievieno vēl pienu vēlamajai biezībai.',
                    'Pasniedz uzreiz atdzesētās glāzēs.',
                ],
            ],
        ];

        foreach ($recipes as $data) {
            $categoryName = RecipeCategoryCatalog::normalizeOrFallback($data['category']);
            $categoryId = $categories[$categoryName] ?? null;
            if (!$categoryId) {
                continue;
            }

            $recipe = Recipe::updateOrCreate(
                ['title' => $data['title']],
                [
                    'description' => $data['description'],
                    'category_id' => $categoryId,
                    'user_id' => $author->id,
                    'prep_time_minutes' => $data['prep_time_minutes'],
                    'difficulty' => $data['difficulty'],
                    'image_url' => $data['image_url'],
                ]
            );

            $sync = [];
            foreach ($data['ingredients'] as $ingredientData) {
                $ingredient = Ingredient::firstOrCreate(['name' => $ingredientData['name']]);
                $sync[$ingredient->id] = [
                    'amount' => $ingredientData['amount'],
                    'unit' => $ingredientData['unit'],
                ];
            }
            $recipe->ingredients()->sync($sync);

            $recipe->steps()->delete();
            foreach ($data['steps'] as $idx => $instruction) {
                $recipe->steps()->create([
                    'step_number' => $idx + 1,
                    'instruction' => $instruction,
                ]);
            }
        }
    }
}

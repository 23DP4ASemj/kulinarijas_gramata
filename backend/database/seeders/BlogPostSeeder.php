<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'author@demo.lv')->first()
            ?? User::where('role', User::ROLE_ADMIN)->first()
            ?? User::first();

        if (!$author) {
            return;
        }

        $posts = [
            [
                'title' => '5 padomi ideālai brokastu bļodai',
                'category' => 'Padomi',
                'excerpt' => 'Vienkārši principi, kas palīdz veidot sabalansētas un gardas brokastis katru rītu.',
                'content' => "Ja vēlies brokastis, kas dod enerģiju ilgākam laikam, sāc ar olbaltumvielu avotu.\nPievieno pilngraudu pārslas vai sēklas, lai iegūtu šķiedrvielas.\nNeaizmirsti par svaigiem vai saldētiem augļiem.\nNoslēgumā pievieno kādu veselīgo tauku avotu, piemēram, riekstus vai zemesriekstu sviestu.\nTā vari variēt garšas katru dienu, saglabājot sabalansētu uzturu.",
                'image_url' => 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 230,
                'comments_count' => 8,
            ],
            [
                'title' => 'Kā pareizi uzglabāt garšaugus',
                'category' => 'Produktu apskati',
                'excerpt' => 'Praktiski ieteikumi, lai dilles, baziliks un pētersīļi saglabātos svaigi ilgāk.',
                'content' => "Dilles un pētersīļus vari uzglabāt glāzē ar ūdeni, pārklājot ar vieglu maisiņu.\nBazilikam labāk patīk istabas temperatūra, nevis ledusskapis.\nJa vēlies garšaugus saglabāt ilgāk, sasmalcini tos un sasaldē eļļā ledus formiņās.\nTā ēdiena gatavošana būs ātrāka, un garša saglabāsies intensīva.",
                'image_url' => 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 184,
                'comments_count' => 5,
            ],
            [
                'title' => 'Ātrās vakariņas: plāns 20 minūtēm',
                'category' => 'Receptes',
                'excerpt' => 'Kad laika ir maz, šis plāns palīdz pagatavot pilnvērtīgu maltīti bez stresa.',
                'content' => "Sāc ar vienkāršu bāzi: makaroni, rīsi vai kuskuss.\nKamēr tie gatavojas, uz pannas apcep dārzeņus un olbaltumvielu avotu.\nPievieno mērci vai garšvielas, lai viss apvienotos vienā ēdienā.\nSvarīgākais ir iepriekš sagatavotas sastāvdaļas un skaidra secība.\nŠī pieeja palīdz izvairīties no haosa darba dienu vakaros.",
                'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 312,
                'comments_count' => 13,
            ],
            [
                'title' => 'Intervija ar vietējo konditoru',
                'category' => 'Intervijas',
                'excerpt' => 'Saruna par desertu tendencēm un biežākajām kļūdām mājas cepšanā.',
                'content' => "Konditors uzsver: precīzi svari ir tikpat svarīgi kā laba recepte.\nBiežākā kļūda ir nepareiza produktu temperatūra un steiga cepšanas laikā.\nLai deserti izdotos, jāievēro secība un jāļauj masai atpūsties.\nIntervijā apskatīti arī aktuālie desertu virzieni un noformējuma idejas.",
                'image_url' => 'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 141,
                'comments_count' => 4,
            ],
            [
                'title' => 'Kāpēc maltīšu plānošana ietaupa laiku',
                'category' => 'Padomi',
                'excerpt' => 'Nedēļas plāns palīdz samazināt spontānus pirkumus un uzturēt veselīgu ēdienkarti.',
                'content' => "Izveido vienkāršu nedēļas plānu ar 4–5 pamatēdieniem.\nVienu vakaru velti sastāvdaļu sagatavošanai: sagriez dārzeņus, izvāri graudaugus, marinē gaļu.\nIkdienā atliek tikai salikt ēdienu kopā un pielāgot garšas.\nTas palīdz samazināt stresa līmeni un pārtikas izšķērdēšanu.",
                'image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 205,
                'comments_count' => 6,
            ],
            [
                'title' => 'Sezonas produkti martam: ko gatavot',
                'category' => 'Produktu apskati',
                'excerpt' => 'Apskats par produktiem, kas martā ir pieejami un piemēroti ikdienas receptēm.',
                'content' => "Martā īpaši noder sakņu dārzeņi, pākšaugi un skābētie produkti.\nNo tiem var gatavot sātīgas zupas, sacepumus un salātus ar izteiksmīgu garšu.\nSezonas izvēle bieži ir draudzīgāka budžetam un vienkāršāka plānošanai.\nPlānojot ēdienkarti pēc sezonas, iegūsi vairāk dažādības ikdienā.",
                'image_url' => 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1200&q=80',
                'views_count' => 167,
                'comments_count' => 3,
            ],
        ];

        foreach ($posts as $data) {
            BlogPost::updateOrCreate(
                ['title' => $data['title']],
                [
                    ...$data,
                    'user_id' => $author->id,
                ]
            );
        }
    }
}

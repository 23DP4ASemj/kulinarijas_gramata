# Kulinārijas Grāmata

`Kulinārijas Grāmata` ir sociāla web platforma kulinārijas cienītājiem: receptes, kopiena, personalizēti ieteikumi, meklēšana, favorīti, komentāri un kolekcijas.

Šis ir mācību fullstack projekts ar:
- Frontend: Vue 3 + Vite + Vuetify + Vue Router + Pinia
- Backend: Laravel + SQLite + REST JSON API

Interfeiss ir tikai latviešu valodā (LV).

## Projekta ideja

Platforma veidota kā moderna vide, kur lietotāji var:
- ātri atrast receptes pēc nosaukuma, kategorijas vai sastāvdaļām
- saglabāt favorītus un kolekcijas
- sekot autoriem (abonementi)
- publicēt receptes un bloga rakstus (autoru režīms)

## Lomas

- `guest`: nav autorizēts lietotājs
- `user`: autorizēts lietotājs
- `author`: var publicēt receptes un bloga rakstus
- `admin`: vienīgais administrators ar paplašinātām tiesībām

## Galvenās funkcijas

### Viesiem
- recepšu apskate
- recepšu detaļas
- publiskie autoru profili
- bloga rakstu lasīšana
- Panelis ar publisko kulinārijas API meklēšanu

### Reģistrētiem lietotājiem
- privātais profils
- favorīti
- kolekcijas
- komentāri un vērtējumi
- abonementi (sekot/atsekot autorus)

### Autoriem
- recepšu publicēšana (`/pievienot-recepti`)
- bloga rakstu publicēšana (`/blogs`)

### Administratoriem
- pilnas tiesības + administrēšanas API (ja izmantots)

## Datu modelis

Projektā izmantotas entītijas:
- Lietotājs
- Recepte
- Kategorija
- Sastāvdaļa
- Kolekcija
- Komentārs
- Vērtējums
- Bloga raksts
- Abonementi (user_follows)

## Navigācija (frontend)

Desktop un mobile (drawer):
- Galvenā
- Receptes
- Kolekcijas
- Abonementi
- Blogs
- Pievienot recepti
- Panelis
- Profils (pēc ielogošanās)

Auth stāvoklis:
- Izlogots: poga `Autorizācija` ar izvēlni `Ieiet` / `Reģistrācija`
- Ielogots: poga `Profils` (ar lietotājvārdu), `Autorizācija` paslēpta

## Lapas

- `/` Galvenā
- `/receptes` Receptes
- `/receptes/:id` Receptes detaļa
- `/pievienot-recepti` Receptes izveide (author/admin)
- `/kolekcijas` Kolekcijas (protected)
- `/abonementi` Abonementi (protected)
- `/blogs` Blogs
- `/panelis` Panelis
- `/kontakti` Kontakti
- `/profile` Privātais profils (protected)
- `/u/:id` Publiskais profils
- `/login`, `/register`

## Panelis API avoti

Panelis izmanto 2 publiskus kulinārijas API bez atslēgas:
- TheMealDB
- Open Food Facts

Ja nav rezultātu vai kļūda, tiek rādīts tieši: `Dati nav pieejami`.

## localStorage izmantojums

Obligāti saglabātie dati:
- `kg_theme` (tumšais/gaišais režīms)
- `kg_dashboard_history` (Panelis meklējumu vēsture, pēdējie 3-5)

Papildus:
- `kg_local_cards_v1` (Galvenās lapas lokālās kartītes CRUD)

## Backend palaišana

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Izveido SQLite failu, ja nav:

```bash
mkdir -p database
touch database/database.sqlite
```

Pārbaudi `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite

ADMIN_NAME="Administrators"
ADMIN_EMAIL=admin@admin.lv
ADMIN_PASSWORD=
DEMO_USER_PASSWORD=password

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Migrācijas un sēkla:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

## Frontend palaišana

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Ja nepieciešams, frontend `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Atver: `http://127.0.0.1:5173`

## Admin konts (drošība)

Admin kredenciāļi nav hardkodēti kodā vai README.
Vienīgais admin tiek veidots no `.env` vērtībām:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME` (neobligāts)

Ja `ADMIN_PASSWORD` ir tukšs, admin konts netiek izveidots.
Seeder nodrošina vienu admin kontu sistēmā.

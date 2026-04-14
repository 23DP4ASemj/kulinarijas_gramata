<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $demoPassword = env('DEMO_USER_PASSWORD', 'password');
        $adminEmail = trim((string) env('ADMIN_EMAIL', 'admin@admin.lv'));
        $adminPassword = (string) env('ADMIN_PASSWORD', '');
        $adminName = (string) env('ADMIN_NAME', 'Administrators');

        $users = [
            [
                'name' => 'Author Jane',
                'email' => 'author@demo.lv',
                'role' => User::ROLE_USER,
            ],
            [
                'name' => 'Demo User',
                'email' => 'user@demo.lv',
                'role' => User::ROLE_USER,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($demoPassword),
                    'role' => $data['role'],
                    'email_verified_at' => now(),
                ]
            );
        }

        $author = User::where('email', 'author@demo.lv')->first();
        $demoUser = User::where('email', 'user@demo.lv')->first();
        if ($author && $demoUser) {
            $author->followers()->syncWithoutDetaching([$demoUser->id]);
        }

        if ($adminEmail === '' || $adminPassword === '') {
            return;
        }

        User::where('role', User::ROLE_ADMIN)
            ->where('email', '!=', $adminEmail)
            ->update(['role' => User::ROLE_USER]);

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => Hash::make($adminPassword),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );
    }
}

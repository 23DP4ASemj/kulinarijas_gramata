<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = trim((string) env('ADMIN_EMAIL', 'admin@admin.lv'));
        $adminPassword = (string) env('ADMIN_PASSWORD', '');
        $adminName = (string) env('ADMIN_NAME', 'Administrators');

        if ($adminEmail === '' || $adminPassword === '') {
            return;
        }

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

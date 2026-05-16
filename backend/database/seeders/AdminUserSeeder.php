<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
{
        User::updateOrCreate(
            ['email' => 'test@test.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('test111'),
                'role' => 'admin',
            ]
        );


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

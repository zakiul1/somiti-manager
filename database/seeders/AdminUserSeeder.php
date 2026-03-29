<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@somiti.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => 'password',
                'is_active' => true,
                'portal_access_enabled' => false,
            ]
        );

        if (! $user->hasRole('super-admin')) {
            $user->assignRole('super-admin');
        }
    }
}

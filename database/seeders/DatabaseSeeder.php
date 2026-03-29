<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            SettingsSeeder::class,
            CustomerSeeder::class,
            GuarantorSeeder::class,
            LoanSeeder::class,
            DocumentSeeder::class,
        ]);
    }
}
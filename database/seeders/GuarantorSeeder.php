<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Guarantor;
use Illuminate\Database\Seeder;

class GuarantorSeeder extends Seeder
{
    public function run(): void
    {
        if (Guarantor::query()->exists() || ! Customer::query()->exists()) {
            return;
        }

        Guarantor::factory()->count(12)->create();
    }
}

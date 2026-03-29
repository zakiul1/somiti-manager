<?php

namespace Database\Seeders;

use App\Models\Guarantor;
use App\Models\Loan;
use Illuminate\Database\Seeder;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        Loan::factory()->count(12)->create()->each(function (Loan $loan) {
            $guarantorIds = Guarantor::query()
                ->where('customer_id', $loan->customer_id)
                ->inRandomOrder()
                ->limit(rand(1, 2))
                ->pluck('id');

            if ($guarantorIds->isEmpty()) {
                $guarantorIds = Guarantor::query()->inRandomOrder()->limit(1)->pluck('id');
            }

            $loan->guarantors()->sync($guarantorIds);
        });
    }
}

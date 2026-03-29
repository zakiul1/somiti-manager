<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    protected $model = Loan::class;

    public function definition(): array
    {
        $principal = fake()->numberBetween(10000, 150000);
        $interestRate = fake()->randomElement([10, 12, 15, 18, 20]);
        $interestAmount = round(($principal * $interestRate) / 100, 2);

        return [
            'loan_code' => 'LON-' . str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'customer_id' => Customer::query()->inRandomOrder()->value('id') ?? Customer::factory(),
            'principal_amount' => $principal,
            'interest_rate' => $interestRate,
            'interest_amount' => $interestAmount,
            'total_payable' => $principal + $interestAmount,
            'duration_value' => fake()->randomElement([3, 6, 9, 12]),
            'duration_unit' => 'months',
            'collection_frequency' => fake()->randomElement(['weekly', 'monthly']),
            'start_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'first_collection_date' => fake()->dateTimeBetween('now', '+2 weeks')->format('Y-m-d'),
            'status' => fake()->randomElement(['draft', 'active', 'active', 'closed']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

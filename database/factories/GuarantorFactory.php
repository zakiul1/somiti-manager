<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Guarantor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Guarantor>
 */
class GuarantorFactory extends Factory
{
    protected $model = Guarantor::class;

    public function definition(): array
    {
        return [
            'guarantor_code' => 'GUA-' . str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'customer_id' => Customer::query()->inRandomOrder()->value('id') ?? Customer::factory(),
            'name' => fake()->name(),
            'phone' => '01' . fake()->unique()->numerify('#########'),
            'email' => fake()->optional()->safeEmail(),
            'nid_number' => fake()->optional()->numerify('#############'),
            'date_of_birth' => fake()->optional()->dateTimeBetween('-60 years', '-20 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'relationship' => fake()->randomElement(['Brother', 'Sister', 'Father', 'Mother', 'Uncle', 'Neighbor', 'Friend', 'Spouse']),
            'occupation' => fake()->randomElement(['Farmer', 'Shopkeeper', 'Teacher', 'Driver', 'Tailor', 'Business']),
            'address' => fake()->address(),
            'status' => fake()->randomElement(['active', 'active', 'inactive']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'customer_code' => 'CUS-' . str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'name' => fake()->name(),
            'phone' => '01' . fake()->unique()->numerify('#########'),
            'email' => fake()->optional()->safeEmail(),
            'nid_number' => fake()->optional()->numerify('#############'),
            'date_of_birth' => fake()->optional()->dateTimeBetween('-55 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'father_name' => fake()->name('male'),
            'mother_name' => fake()->name('female'),
            'spouse_name' => fake()->optional()->name(),
            'occupation' => fake()->randomElement(['Farmer', 'Shopkeeper', 'Teacher', 'Driver', 'Tailor', 'Homemaker']),
            'present_address' => fake()->address(),
            'permanent_address' => fake()->address(),
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

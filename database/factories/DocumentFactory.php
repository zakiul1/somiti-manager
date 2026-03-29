<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Document;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        $entityType = fake()->randomElement(['customer', 'loan']);
        $customer = Customer::query()->inRandomOrder()->first();

        return [
            'document_code' => 'DOC-' . str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'title' => fake()->randomElement(['NID Copy', 'Loan Agreement', 'Membership Form', 'Photo Verification']),
            'document_type' => fake()->randomElement(['identity', 'agreement', 'application', 'verification']),
            'entity_type' => $entityType,
            'customer_id' => $entityType === 'customer' ? $customer?->id : null,
            'loan_id' => $entityType === 'loan' ? Loan::query()->inRandomOrder()->value('id') : null,
            'issue_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'expiry_date' => fake()->optional()->dateTimeBetween('now', '+1 year'),
            'file_reference' => fake()->optional()->slug() . '.pdf',
            'status' => fake()->randomElement(['draft', 'active', 'expired']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

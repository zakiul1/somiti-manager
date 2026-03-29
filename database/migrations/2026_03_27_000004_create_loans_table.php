<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_code')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->decimal('principal_amount', 12, 2);
            $table->decimal('interest_rate', 5, 2)->comment('Flat interest percentage');
            $table->decimal('interest_amount', 12, 2);
            $table->decimal('total_payable', 12, 2);
            $table->unsignedInteger('duration_value');
            $table->enum('duration_unit', ['days', 'weeks', 'months'])->default('months');
            $table->enum('collection_frequency', ['daily', 'weekly', 'monthly'])->default('weekly');
            $table->date('start_date');
            $table->date('first_collection_date')->nullable();
            $table->enum('status', ['draft', 'active', 'closed', 'defaulted'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};

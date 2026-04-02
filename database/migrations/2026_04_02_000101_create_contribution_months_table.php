<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contribution_months', function (Blueprint $table) {
            $table->id();
            $table->date('month_date')->unique();
            $table->decimal('expected_amount', 12, 2);
            $table->string('title')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('open');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contribution_months');
    }
};

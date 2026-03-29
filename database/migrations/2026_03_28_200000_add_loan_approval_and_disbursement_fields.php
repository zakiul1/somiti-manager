<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('first_collection_date');
            $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->text('approval_notes')->nullable()->after('approved_by');

            $table->decimal('disbursement_amount', 14, 2)->nullable()->after('approval_notes');
            $table->date('disbursed_at')->nullable()->after('disbursement_amount');
            $table->foreignId('disbursed_by')->nullable()->after('disbursed_at')->constrained('users')->nullOnDelete();
            $table->string('disbursement_method')->nullable()->after('disbursed_by');
            $table->string('disbursement_reference')->nullable()->after('disbursement_method');
            $table->text('disbursement_notes')->nullable()->after('disbursement_reference');
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropConstrainedForeignId('disbursed_by');
            $table->dropColumn([
                'approved_at',
                'approval_notes',
                'disbursement_amount',
                'disbursed_at',
                'disbursement_method',
                'disbursement_reference',
                'disbursement_notes',
            ]);
        });
    }
};

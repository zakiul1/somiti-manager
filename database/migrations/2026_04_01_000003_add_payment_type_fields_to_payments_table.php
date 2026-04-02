<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'payment_type')) {
                $table->string('payment_type', 50)->default('regular')->after('payment_method');
            }

            if (! Schema::hasColumn('payments', 'batch_reference')) {
                $table->string('batch_reference')->nullable()->after('payment_type');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('payments')) {
            return;
        }

        Schema::table('payments', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('payments', 'payment_type')) {
                $columns[] = 'payment_type';
            }

            if (Schema::hasColumn('payments', 'batch_reference')) {
                $columns[] = 'batch_reference';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};

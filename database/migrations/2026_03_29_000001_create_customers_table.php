<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('customers')) {
            return;
        }

        if (Schema::hasColumn('customers', 'name') && ! Schema::hasColumn('customers', 'full_name')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->string('full_name')->nullable()->after('customer_code');
            });

            DB::table('customers')->update(['full_name' => DB::raw('name')]);
        }

        Schema::table('customers', function (Blueprint $table) {
            foreach (['photo_path', 'nid_front_path', 'nid_back_path'] as $column) {
                if (! Schema::hasColumn('customers', $column)) {
                    $table->string($column)->nullable();
                }
            }
        });
    }

    public function down(): void
    {
        // Compatibility migration; do not drop columns in rollback.
    }
};

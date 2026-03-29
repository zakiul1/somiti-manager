<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('guarantors')) {
            return;
        }

        if (Schema::hasColumn('guarantors', 'name') && ! Schema::hasColumn('guarantors', 'full_name')) {
            Schema::table('guarantors', function (Blueprint $table) {
                $table->string('full_name')->nullable()->after('customer_id');
            });

            DB::table('guarantors')->update(['full_name' => DB::raw('name')]);
        }

        Schema::table('guarantors', function (Blueprint $table) {
            foreach (['photo_path', 'nid_front_path', 'nid_back_path'] as $column) {
                if (! Schema::hasColumn('guarantors', $column)) {
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

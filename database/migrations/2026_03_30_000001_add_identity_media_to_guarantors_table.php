<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            if (! Schema::hasColumn('guarantors', 'photo_path')) {
                $table->string('photo_path')->nullable()->after('occupation');
            }
            if (! Schema::hasColumn('guarantors', 'nid_front_path')) {
                $table->string('nid_front_path')->nullable()->after('photo_path');
            }
            if (! Schema::hasColumn('guarantors', 'nid_back_path')) {
                $table->string('nid_back_path')->nullable()->after('nid_front_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            $drop = [];
            foreach (["photo_path", "nid_front_path", "nid_back_path"] as $column) {
                if (Schema::hasColumn('guarantors', $column)) {
                    $drop[] = $column;
                }
            }
            if ($drop) {
                $table->dropColumn($drop);
            }
        });
    }
};

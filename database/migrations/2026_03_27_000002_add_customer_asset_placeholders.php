<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('occupation');
            $table->string('nid_front_path')->nullable()->after('photo_path');
            $table->string('nid_back_path')->nullable()->after('nid_front_path');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'nid_front_path', 'nid_back_path']);
        });
    }
};

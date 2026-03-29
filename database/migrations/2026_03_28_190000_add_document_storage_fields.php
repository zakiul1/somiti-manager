<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('file_reference');
            $table->string('original_file_name')->nullable()->after('file_path');
            $table->string('mime_type')->nullable()->after('original_file_name');
            $table->unsignedBigInteger('file_size_bytes')->nullable()->after('mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'original_file_name', 'mime_type', 'file_size_bytes']);
        });
    }
};

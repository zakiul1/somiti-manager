<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('loans')
            ->whereIn('status', ['draft', 'approved'])
            ->update([
                'status' => 'active',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Historical draft/approved values are normalized into active loans.
    }
};

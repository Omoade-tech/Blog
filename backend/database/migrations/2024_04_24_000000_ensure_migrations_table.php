<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if migrations table exists
        if (!Schema::hasTable('migrations')) {
            Schema::create('migrations', function (Blueprint $table) {
                $table->id();
                $table->string('migration');
                $table->integer('batch');
            });
            
            // Insert existing migrations
            $migrations = [
                '2025_02_18_082256_create_users_table',
                '2025_02_20_082830_create_blogs_table',
                '2025_02_26_141649_create_personal_access_tokens_table',
                '2023_03_27_000000_fix_personal_access_tokens_table',
                '2023_03_28_000000_fix_all_tables',
                '2024_04_24_000000_ensure_migrations_table'
            ];
            
            foreach ($migrations as $index => $migration) {
                DB::table('migrations')->insert([
                    'migration' => $migration,
                    'batch' => 1
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop the migrations table
    }
}; 
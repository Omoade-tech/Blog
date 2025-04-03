<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreateSanctumTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sanctum:create-table';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manually create the personal_access_tokens table for Sanctum';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for personal_access_tokens table...');
        
        try {
            // Check database connection first
            try {
                DB::connection()->getPdo();
                $this->info('Database connection established successfully.');
            } catch (\Exception $e) {
                $this->error('Cannot connect to database: ' . $e->getMessage());
                Log::error('Database connection failed: ' . $e->getMessage());
                return 1;
            }
            
            if (Schema::hasTable('personal_access_tokens')) {
                $this->info('Table personal_access_tokens already exists!');
                return 0;
            }
            
            $this->info('Creating personal_access_tokens table...');
            
            // Try to create table using Schema builder
            try {
                Schema::create('personal_access_tokens', function ($table) {
                    $table->id();
                    $table->morphs('tokenable');
                    $table->string('name');
                    $table->string('token', 64)->unique();
                    $table->text('abilities')->nullable();
                    $table->timestamp('last_used_at')->nullable();
                    $table->timestamp('expires_at')->nullable();
                    $this->info('Adding timestamps...');
                    $table->timestamps();
                });
                
                // Additional index for performance
                DB::statement('CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id)');
                
                $this->info('Table personal_access_tokens created successfully!');
                Log::info('Created personal_access_tokens table successfully');
                return 0;
            } catch (\Exception $schemaError) {
                $this->error('Schema builder failed: ' . $schemaError->getMessage());
                Log::error('Schema builder failed: ' . $schemaError->getMessage());
                
                // Fallback to raw SQL if Schema builder fails
                $this->info('Trying fallback SQL method...');
                try {
                    $sql = file_get_contents(base_path('create_sanctum_tables.sql'));
                    DB::unprepared($sql);
                    $this->info('Table personal_access_tokens created using SQL fallback!');
                    Log::info('Created personal_access_tokens table using SQL fallback');
                    return 0;
                } catch (\Exception $sqlError) {
                    $this->error('SQL fallback failed: ' . $sqlError->getMessage());
                    Log::error('SQL fallback failed: ' . $sqlError->getMessage());
                    throw $sqlError;
                }
            }
        } catch (\Exception $e) {
            $this->error('Failed to create table: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            Log::error('Failed to create personal_access_tokens table: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
} 
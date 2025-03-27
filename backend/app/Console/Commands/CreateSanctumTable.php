<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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
        
        if (Schema::hasTable('personal_access_tokens')) {
            $this->info('Table personal_access_tokens already exists!');
            return;
        }
        
        $this->info('Creating personal_access_tokens table...');
        
        try {
            Schema::create('personal_access_tokens', function ($table) {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
            
            // Additional index for performance
            DB::statement('CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id)');
            
            $this->info('Table personal_access_tokens created successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to create table: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
        }
    }
} 
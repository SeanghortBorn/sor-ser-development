<?php

namespace App\Console\Commands;

use App\Services\CacheService;
use Illuminate\Console\Command;

class WarmCache extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cache:warm';

    /**
     * The console command description.
     */
    protected $description = 'Warm cache with frequently accessed data';

    /**
     * Execute the console command.
     */
    public function handle(CacheService $cacheService): int
    {
        $this->info('Warming cache...');

        try {
            $cacheService->warmCache();

            $this->info('✓ Cache warmed successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('✗ Failed to warm cache: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

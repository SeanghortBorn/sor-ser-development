<?php

namespace App\Console\Commands;

use App\Jobs\SendProgressReport;
use App\Models\User;
use Illuminate\Console\Command;

class SendWeeklyReports extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reports:send-weekly {--user-id= : Send report to specific user only}';

    /**
     * The console command description.
     */
    protected $description = 'Send weekly progress reports to all active users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Queueing weekly progress reports...');

        if ($userId = $this->option('user-id')) {
            // Send to specific user
            $user = User::find($userId);

            if (!$user) {
                $this->error("User {$userId} not found");
                return Command::FAILURE;
            }

            SendProgressReport::dispatch($userId, 'weekly');
            $this->info("✓ Report queued for user: {$user->name} ({$user->email})");
            return Command::SUCCESS;
        }

        // Send to all active users with student role
        $users = User::whereHas('roles', function ($query) {
            $query->where('name', 'student');
        })
        ->where('is_active', true)
        ->get();

        $count = 0;
        foreach ($users as $user) {
            SendProgressReport::dispatch($user->id, 'weekly');
            $count++;
        }

        $this->info("✓ Weekly reports queued for {$count} users");
        return Command::SUCCESS;
    }
}

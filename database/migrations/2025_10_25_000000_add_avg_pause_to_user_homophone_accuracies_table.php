<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_homophone_accuracies') && !Schema::hasColumn('user_homophone_accuracies', 'avg_pause_duration')) {
            Schema::table('user_homophone_accuracies', function (Blueprint $table) {
                $table->decimal('avg_pause_duration', 8, 2)->nullable()->after('missing_count');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_homophone_accuracies') && Schema::hasColumn('user_homophone_accuracies', 'avg_pause_duration')) {
            Schema::table('user_homophone_accuracies', function (Blueprint $table) {
                $table->dropColumn('avg_pause_duration');
            });
        }
    }
};

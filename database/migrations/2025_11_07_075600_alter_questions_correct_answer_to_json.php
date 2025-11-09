<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration {
    public function up(): void
    {
        // Convert correct_answer from VARCHAR to JSON (MySQL)
        Schema::table('questions', function (Blueprint $table) {
            // keep placeholder to ensure table exists in Blueprint context
        });
        DB::statement('ALTER TABLE `questions` MODIFY `correct_answer` JSON NULL');
    }

    public function down(): void
    {
        // Revert back to string (255)
        Schema::table('questions', function (Blueprint $table) {
            // Blueprint doesn't support JSON -> string without DBAL, so raw SQL
        });
        DB::statement('ALTER TABLE `questions` MODIFY `correct_answer` VARCHAR(255) NULL');
    }
};

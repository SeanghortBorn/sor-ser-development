<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'none' to typing_mode enum
        DB::statement("ALTER TABLE article_settings MODIFY COLUMN typing_mode ENUM('nlp_only', 'nlp_la', 'none') DEFAULT 'none'");
    }

    public function down(): void
    {
        // Remove 'none' from enum
        DB::statement("ALTER TABLE article_settings MODIFY COLUMN typing_mode ENUM('nlp_only', 'nlp_la') DEFAULT 'nlp_la'");
    }
};
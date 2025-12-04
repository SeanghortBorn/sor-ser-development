<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('article_settings', function (Blueprint $table) {
            $table->decimal('min_completion_percentage', 5, 2)
                  ->default(70.00)
                  ->after('typing_mode')
                  ->comment('Minimum completion % to unlock next article');
            
            $table->string('group_a_redirect', 255)
                  ->nullable()
                  ->after('min_completion_percentage')
                  ->comment('Redirect URL for NLP-only group after completion');
            
            $table->string('group_b_redirect', 255)
                  ->nullable()
                  ->after('group_a_redirect')
                  ->comment('Redirect URL for NLP+LA group after completion');
        });
    }

    public function down(): void
    {
        Schema::table('article_settings', function (Blueprint $table) {
            $table->dropColumn(['min_completion_percentage', 'group_a_redirect', 'group_b_redirect']);
        });
    }
};
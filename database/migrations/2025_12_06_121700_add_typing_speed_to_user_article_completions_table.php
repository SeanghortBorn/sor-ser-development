<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_article_completions', function (Blueprint $table) {
            $table->decimal('typing_speed', 5, 2)->nullable()->after('best_accuracy')->comment('User typing speed in WPM for this article');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_article_completions', function (Blueprint $table) {
            $table->dropColumn('typing_speed');
        });
    }
};

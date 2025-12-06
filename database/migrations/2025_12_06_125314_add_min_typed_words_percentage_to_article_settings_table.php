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
        Schema::table('article_settings', function (Blueprint $table) {
            $table->decimal('min_typed_words_percentage', 5, 2)->nullable()->after('min_typing_speed')->comment('Minimum percentage of article words that must be typed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_settings', function (Blueprint $table) {
            $table->dropColumn('min_typed_words_percentage');
        });
    }
};

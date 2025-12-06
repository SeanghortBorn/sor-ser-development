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
            $table->decimal('min_typing_speed', 5, 2)->nullable()->after('min_completion_percentage')->comment('Minimum typing speed (WPM) required to unlock next article');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_settings', function (Blueprint $table) {
            $table->dropColumn('min_typing_speed');
        });
    }
};

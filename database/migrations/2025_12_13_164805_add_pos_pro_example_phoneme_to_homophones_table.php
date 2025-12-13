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
        Schema::table('homophones', function (Blueprint $table) {
            // Add pos (Part of Speech) column
            $table->string('pos', 255)->nullable()->after('word');
            
            // Add pro (Pronunciation) column - distinct from pronunciation
            $table->string('pro', 255)->nullable()->after('pos');
            
            // Add example column (single text field)
            $table->text('example')->nullable()->after('definition');
            
            // Add phoneme column
            $table->string('phoneme', 255)->nullable()->after('example');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homophones', function (Blueprint $table) {
            $table->dropColumn(['pos', 'pro', 'example', 'phoneme']);
        });
    }
};

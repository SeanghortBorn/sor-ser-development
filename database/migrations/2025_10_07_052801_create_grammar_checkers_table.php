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
        Schema::create('grammar_checkers', function (Blueprint $table) {
            $table->id(); // Primary ID
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Relation with users table
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('set null'); // Optional: link to articles
            $table->string('title')->default('Untitled document'); // Grammar check title
            $table->longText('paragraph')->nullable(); // Text for checking, allow NULL
            $table->integer('word_count')->default(0); // Total word count
            $table->integer('incorrect_word_count')->default(0); // Incorrect words
            $table->integer('reading_time')->default(0); // Reading time in seconds
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grammar_checkers');
    }
};

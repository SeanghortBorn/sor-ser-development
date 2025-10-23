<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_homophone_accuracies', function (Blueprint $table) {
            $table->id();

            // core refs
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('grammar_checker_id')->nullable()->constrained('grammar_checkers')->onDelete('cascade');

            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('cascade');

            // core metrics
            $table->decimal('accuracy', 5, 2)->nullable();
            $table->integer('replaced_count')->default(0);
            $table->integer('extra_count')->default(0);
            $table->integer('missing_count')->default(0);

            // UI-supplied fields (from details modal)
            $table->integer('user_word_count')->nullable();
            $table->integer('article_total_words')->nullable();
            $table->integer('reading_time_seconds')->nullable();

            $table->timestamps();

            // indexes
            $table->index(['user_id', 'grammar_checker_id', 'article_id', 'created_at'], 'uha_user_gc_art_created');

            // ensure only one record per user + grammar_checker (upsert target)
            $table->unique(['user_id', 'grammar_checker_id'], 'uha_user_gc_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_homophone_accuracies');
    }
};

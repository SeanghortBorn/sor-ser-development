<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_article_completions', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->foreignId('article_id')
                  ->constrained('articles')
                  ->onDelete('cascade');
            
            $table->timestamp('completed_at')->nullable();
            $table->decimal('best_accuracy', 5, 2)->nullable();
            $table->integer('attempt_count')->default(1);
            $table->foreignId('grammar_checker_id')
                  ->nullable()
                  ->constrained('grammar_checkers')
                  ->onDelete('set null');
            
            $table->timestamp('next_unlock_at')->nullable();
            
            $table->enum('status', ['in_progress', 'completed', 'passed', 'failed'])
                  ->default('in_progress');
            
            $table->integer('total_time_spent')->default(0);
            
            $table->timestamps();
            
            $table->unique(['user_id', 'article_id'], 'user_article_unique');
            
            $table->index('completed_at');
            $table->index('status');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_article_completions');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_settings', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('article_id')
                  ->constrained('articles')
                  ->onDelete('cascade')
                  ->unique();
            
            $table->integer('display_order')->default(0);
            $table->foreignId('prerequisite_article_id')
                  ->nullable()
                  ->constrained('articles')
                  ->onDelete('set null');
            
            $table->integer('unlock_delay_days')->default(0);
            $table->integer('unlock_delay_hours')->default(0);
            
            $table->enum('availability_mode', ['always', 'sequential', 'time_gated'])
                  ->default('sequential');
            
            $table->enum('typing_mode', ['nlp_only', 'nlp_la'])
                  ->default('nlp_only');
            
            $table->string('slug')->nullable()->index();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_required')->default(true);
            $table->integer('max_attempts')->nullable();
            $table->decimal('min_completion_accuracy', 5, 2)->nullable();
            
            $table->timestamps();
            
            $table->index('display_order');
            $table->index('availability_mode');
            $table->index('typing_mode');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_settings');
    }
};
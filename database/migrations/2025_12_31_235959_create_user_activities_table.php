<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('grammar_checker_id')->nullable()->constrained('grammar_checkers')->onDelete('cascade');
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('cascade');
            
            // Activity type: 'text_input', 'comparison_action', 'audio_play', 'audio_pause', 'audio_rewind'
            $table->string('activity_type', 50);
            
            // For text input tracking
            $table->text('character_entered')->nullable();
            
            // For comparison actions (accept/dismiss)
            $table->string('action')->nullable(); // 'accept' or 'dismiss'
            $table->string('comparison_type')->nullable(); // 'missing', 'replaced', 'extra'
            $table->string('user_word')->nullable();
            $table->string('article_word')->nullable();
            $table->integer('word_position')->nullable();
            
            // For audio tracking
            $table->foreignId('audio_id')->nullable()->constrained('audios')->onDelete('cascade');
            $table->integer('play_count')->default(0);
            $table->integer('rewind_count')->default(0);
            $table->integer('forward_count')->default(0);
            $table->decimal('playback_position', 8, 2)->nullable(); // seconds
            $table->decimal('pause_duration', 8, 2)->nullable(); // seconds
            $table->timestamp('pause_started_at')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // For additional context
            $table->string('session_id', 100)->nullable();
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['user_id', 'activity_type', 'created_at']);
            $table->index(['grammar_checker_id', 'created_at']);
            $table->index(['article_id', 'created_at']);
            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};

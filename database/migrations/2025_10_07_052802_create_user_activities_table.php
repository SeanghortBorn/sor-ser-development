<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 2. Comparison activities
        Schema::create('user_comparison_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('grammar_checker_id')->nullable()->constrained('grammar_checkers')->onDelete('cascade');
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('cascade');
            $table->string('action')->nullable(); // 'accept' or 'dismiss'
            $table->string('comparison_type')->nullable(); // 'missing', 'replaced', 'extra'
            $table->string('user_word')->nullable();
            $table->string('article_word')->nullable();
            $table->integer('word_position')->nullable();
            $table->json('metadata')->nullable();
            $table->string('session_id', 100)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'grammar_checker_id', 'article_id', 'created_at'], 'ucmp_user_gc_art_created');
            $table->index('session_id', 'ucmp_session');
        });

        // 3. Audio activities
        Schema::create('user_audio_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('audio_id')->nullable()->constrained('audios')->onDelete('cascade');
            $table->foreignId('article_id')->nullable()->constrained('articles')->onDelete('cascade');
            $table->foreignId('grammar_checker_id')->nullable()->constrained('grammar_checkers')->onDelete('cascade');
            $table->string('activity_type', 50); // 'audio_play', 'audio_pause', etc.
            $table->integer('play_count')->default(0);
            $table->integer('rewind_count')->default(0);
            $table->integer('forward_count')->default(0);
            $table->decimal('playback_position', 8, 2)->nullable();
            $table->decimal('pause_duration', 8, 2)->nullable();
            $table->timestamp('pause_started_at')->nullable();
            $table->json('metadata')->nullable();
            $table->string('session_id', 100)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'audio_id', 'article_id', 'activity_type', 'created_at'], 'uaud_user_audio_art_act_created');
            $table->index('session_id', 'uaud_session');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_comparison_activities');
        Schema::dropIfExists('user_audio_activities');
    }
};

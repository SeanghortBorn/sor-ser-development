<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_typing_activities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('grammar_checker_id')
                ->constrained('grammar_checkers')
                ->onDelete('cascade');

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('character', 50)->nullable();

            $table->tinyInteger('status')->default(1);

            $table->timestamps();

            // Use short index names
            $table->index(
                ['grammar_checker_id', 'user_id', 'created_at'],
                'utyp_gc_user_created'
            );

            $table->index('status', 'utyp_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_typing_activities');
    }
};

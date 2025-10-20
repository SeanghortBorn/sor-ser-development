<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grammar_checker_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grammar_checker_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->unique(['grammar_checker_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grammar_checker_tag');
    }
};

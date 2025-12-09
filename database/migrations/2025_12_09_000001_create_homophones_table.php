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
        // Main homophones table
        Schema::create('homophones', function (Blueprint $table) {
            $table->id();
            $table->string('word', 255)->index();
            $table->text('definition')->nullable();
            $table->string('pronunciation', 255)->nullable();
            $table->json('examples')->nullable();
            $table->text('explanation')->nullable(); // For word explanations
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index(['is_active', 'created_at']);
            $table->fullText('word'); // For fast word search
        });

        // Homophone variants table (one-to-many relationship)
        Schema::create('homophone_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homophone_id')
                ->constrained('homophones')
                ->onDelete('cascade');
            $table->string('variant_word', 255)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Composite index for efficient queries
            $table->index(['homophone_id', 'sort_order']);
        });

        // Optional: Homophone groups for categorization
        Schema::create('homophone_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_name', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Many-to-many relationship between homophones and groups
        Schema::create('homophone_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')
                ->constrained('homophone_groups')
                ->onDelete('cascade');
            $table->foreignId('homophone_id')
                ->constrained('homophones')
                ->onDelete('cascade');
            $table->timestamps();

            // Unique constraint to prevent duplicate group memberships
            $table->unique(['group_id', 'homophone_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homophone_group_members');
        Schema::dropIfExists('homophone_groups');
        Schema::dropIfExists('homophone_variants');
        Schema::dropIfExists('homophones');
    }
};

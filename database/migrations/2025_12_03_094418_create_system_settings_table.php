<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'default_role_id'
            $table->text('value')->nullable(); // Store as JSON if needed
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        // Insert default setting
        DB::table('system_settings')->insert([
            'key' => 'default_role_id',
            'value' => null, // Will be set by admin
            'type' => 'integer',
            'description' => 'Default role assigned to new users on registration',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
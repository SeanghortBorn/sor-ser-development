<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('page_name')->unique();
            $table->text('description')->nullable();
            $table->boolean('requires_admin')->default(true);
            $table->timestamps();
            
            $table->index('page_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_permissions');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_permission_id')
                  ->constrained('page_permissions')
                  ->onDelete('cascade');
            $table->foreignId('role_id')
                  ->nullable()
                  ->constrained('roles')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->enum('permission_type', ['view', 'create', 'update', 'delete', 'block', 'own']);
            $table->foreignId('granted_by')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->timestamps();
            
            $table->index('page_permission_id');
            $table->index('role_id');
            $table->index('user_id');
            $table->unique(['page_permission_id', 'role_id', 'user_id', 'permission_type'], 'unique_permission');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_overrides');
    }
};
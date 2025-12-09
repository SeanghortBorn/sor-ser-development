<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * IMPORTANT: Only run this migration AFTER:
     * 1. Running: php artisan db:seed --class=MigrateToSpatiePermissionsSeeder
     * 2. Verifying all permissions migrated correctly
     * 3. Testing the application with the new Spatie-only permissions
     */
    public function up(): void
    {
        // Drop permission_overrides first (has foreign key to page_permissions)
        Schema::dropIfExists('permission_overrides');

        // Drop page_permissions table
        Schema::dropIfExists('page_permissions');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates the old custom permission tables.
     */
    public function down(): void
    {
        // Recreate page_permissions table
        Schema::create('page_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('page_name')->unique();
            $table->text('description')->nullable();
            $table->boolean('requires_admin')->default(false);
            $table->timestamps();
        });

        // Recreate permission_overrides table
        Schema::create('permission_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_permission_id')->constrained('page_permissions')->onDelete('cascade');
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('permission_type'); // view, create, edit, delete, own, block
            $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['page_permission_id', 'role_id']);
            $table->index(['page_permission_id', 'user_id']);
        });
    }
};

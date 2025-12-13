<?php

namespace App\Repositories\Contracts;

use App\Models\Homophone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface HomophoneRepositoryInterface extends RepositoryInterface
{
    /**
     * Get all active homophones with variants.
     */
    public function getActiveWithVariants(): Collection;

    /**
     * Search homophones by word or variant.
     */
    public function search(string $term): Collection;

    /**
     * Get paginated homophones with search.
     */
    public function getPaginatedWithSearch(?string $search = null, int $perPage = 10, string $sortBy = 'id', string $sortDir = 'asc', string $hasHomophones = ''): LengthAwarePaginator;

    /**
     * Get homophone with all relations.
     */
    public function getWithRelations(int $id): ?Homophone;

    /**
     * Create homophone with variants.
     */
    public function createWithVariants(array $data, array $variants): Homophone;

    /**
     * Update homophone with variants.
     */
    public function updateWithVariants(int $id, array $data, array $variants): bool;

    /**
     * Import multiple homophones.
     */
    public function bulkImport(array $homophones): array;

    /**
     * Clear all homophones.
     */
    public function clearAll(): bool;

    /**
     * Check if word exists.
     */
    public function wordExists(string $word): bool;

    /**
     * Get homophones by group.
     */
    public function getByGroup(int $groupId): Collection;
}

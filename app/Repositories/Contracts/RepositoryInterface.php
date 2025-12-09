<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface RepositoryInterface
{
    /**
     * Get all records.
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Find a record by ID.
     */
    public function find(int $id, array $columns = ['*']): ?Model;

    /**
     * Find a record by ID or fail.
     */
    public function findOrFail(int $id, array $columns = ['*']): Model;

    /**
     * Find records by a specific field.
     */
    public function findBy(string $field, mixed $value, array $columns = ['*']): Collection;

    /**
     * Create a new record.
     */
    public function create(array $data): Model;

    /**
     * Update a record.
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete a record.
     */
    public function delete(int $id): bool;

    /**
     * Get paginated results.
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Get records with relationships.
     */
    public function with(array $relations): self;

    /**
     * Order results.
     */
    public function orderBy(string $column, string $direction = 'asc'): self;

    /**
     * Add where condition.
     */
    public function where(string $column, mixed $operator, mixed $value = null): self;
}

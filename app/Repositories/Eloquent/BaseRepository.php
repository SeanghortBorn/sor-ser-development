<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements RepositoryInterface
{
    protected Model $model;
    protected Builder $query;

    public function __construct()
    {
        $this->makeModel();
        $this->resetQuery();
    }

    /**
     * Specify Model class name.
     */
    abstract protected function model(): string;

    /**
     * Make Model instance.
     */
    protected function makeModel(): void
    {
        $model = app($this->model());

        if (!$model instanceof Model) {
            throw new \Exception("Class {$this->model()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }

        $this->model = $model;
    }

    /**
     * Reset query builder.
     */
    protected function resetQuery(): void
    {
        $this->query = $this->model->newQuery();
    }

    /**
     * Get all records.
     */
    public function all(array $columns = ['*']): Collection
    {
        $result = $this->query->get($columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Find a record by ID.
     */
    public function find(int $id, array $columns = ['*']): ?Model
    {
        $result = $this->query->find($id, $columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Find a record by ID or fail.
     */
    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        $result = $this->query->findOrFail($id, $columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Find records by a specific field.
     */
    public function findBy(string $field, mixed $value, array $columns = ['*']): Collection
    {
        $result = $this->query->where($field, $value)->get($columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Create a new record.
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Update a record.
     */
    public function update(int $id, array $data): bool
    {
        $record = $this->findOrFail($id);
        return $record->update($data);
    }

    /**
     * Delete a record.
     */
    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }

    /**
     * Get paginated results.
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        $result = $this->query->paginate($perPage, $columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Get records with relationships.
     */
    public function with(array $relations): self
    {
        $this->query->with($relations);
        return $this;
    }

    /**
     * Order results.
     */
    public function orderBy(string $column, string $direction = 'asc'): self
    {
        $this->query->orderBy($column, $direction);
        return $this;
    }

    /**
     * Add where condition.
     */
    public function where(string $column, mixed $operator, mixed $value = null): self
    {
        $this->query->where($column, $operator, $value);
        return $this;
    }
}

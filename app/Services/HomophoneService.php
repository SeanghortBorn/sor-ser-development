<?php

namespace App\Services;

use App\Repositories\Contracts\HomophoneRepositoryInterface;
use App\Models\Homophone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class HomophoneService
{
    public function __construct(
        protected HomophoneRepositoryInterface $homophoneRepository
    ) {}

    /**
     * Get all active homophones with their variants.
     */
    public function getAllActive(): Collection
    {
        return $this->homophoneRepository->getActiveWithVariants();
    }

    /**
     * Get paginated homophones with optional search.
     */
    public function getPaginated(?string $search = null, int $perPage = 10, string $sortBy = 'id', string $sortDir = 'asc', string $hasHomophones = ''): LengthAwarePaginator
    {
        return $this->homophoneRepository->getPaginatedWithSearch($search, $perPage, $sortBy, $sortDir, $hasHomophones);
    }

    /**
     * Get a single homophone with all relations.
     */
    public function getById(int $id): ?Homophone
    {
        return $this->homophoneRepository->getWithRelations($id);
    }

    /**
     * Search homophones by term.
     */
    public function search(string $term): Collection
    {
        return $this->homophoneRepository->search($term);
    }

    /**
     * Create a new homophone with variants.
     */
    public function create(array $data): Homophone
    {
        $homophoneData = [
            'word' => $data['word'],
            'pos' => $data['pos'] ?? null,
            'pro' => $data['pro'] ?? null,
            'pronunciation' => $data['pro'] ?? $data['phoneme'] ?? $data['pos'] ?? null,
            'definition' => $data['definition'] ?? null,
            'example' => $data['example'] ?? null,
            'phoneme' => $data['phoneme'] ?? null,
            'examples' => isset($data['example']) ? [$data['example']] : null,
            'is_active' => true,
        ];

        $variants = $data['homophone'] ?? [];

        return $this->homophoneRepository->createWithVariants($homophoneData, $variants);
    }

    /**
     * Update an existing homophone with variants.
     */
    public function update(int $id, array $data): bool
    {
        $homophoneData = [
            'word' => $data['word'],
            'pos' => $data['pos'] ?? null,
            'pro' => $data['pro'] ?? null,
            'pronunciation' => $data['pro'] ?? $data['phoneme'] ?? $data['pos'] ?? null,
            'definition' => $data['definition'] ?? null,
            'example' => $data['example'] ?? null,
            'phoneme' => $data['phoneme'] ?? null,
            'examples' => isset($data['example']) ? [$data['example']] : null,
        ];

        $variants = $data['homophone'] ?? [];

        return $this->homophoneRepository->updateWithVariants($id, $homophoneData, $variants);
    }

    /**
     * Delete a homophone.
     */
    public function delete(int $id): bool
    {
        return $this->homophoneRepository->delete($id);
    }

    /**
     * Import homophones from array.
     */
    public function import(array $homophones): array
    {
        return $this->homophoneRepository->bulkImport($homophones);
    }

    /**
     * Clear all homophones.
     */
    public function clearAll(): bool
    {
        return $this->homophoneRepository->clearAll();
    }

    /**
     * Check if a word already exists.
     */
    public function wordExists(string $word): bool
    {
        return $this->homophoneRepository->wordExists($word);
    }

    /**
     * Get homophones by group.
     */
    public function getByGroup(int $groupId): Collection
    {
        return $this->homophoneRepository->getByGroup($groupId);
    }

    /**
     * Validate homophone data before creation/update.
     */
    public function validateHomophoneData(array $data): array
    {
        $errors = [];

        if (empty($data['word'])) {
            $errors[] = 'Word is required';
        }

        if (empty($data['definition'])) {
            $errors[] = 'Definition is required';
        }

        if (isset($data['homophone']) && !is_array($data['homophone'])) {
            $errors[] = 'Homophone variants must be an array';
        }

        return $errors;
    }

    /**
     * Format homophone data for frontend.
     */
    public function formatForFrontend(Homophone $homophone): array
    {
        return [
            'id' => $homophone->id,
            'word' => $homophone->word,
            'pos' => $homophone->pos,
            'pro' => $homophone->pro,
            'definition' => $homophone->definition,
            'example' => $homophone->example ?? (
                is_array($homophone->examples)
                    ? implode(', ', $homophone->examples)
                    : ($homophone->examples ?? '')
            ),
            'phoneme' => $homophone->phoneme,
            'homophone' => $homophone->variant_words,
            'is_active' => $homophone->is_active,
            'created_at' => $homophone->created_at,
        ];
    }
}

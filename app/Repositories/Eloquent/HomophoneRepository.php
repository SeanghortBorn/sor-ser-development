<?php

namespace App\Repositories\Eloquent;

use App\Models\Homophone;
use App\Models\HomophoneVariant;
use App\Repositories\Contracts\HomophoneRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class HomophoneRepository extends BaseRepository implements HomophoneRepositoryInterface
{
    protected function model(): string
    {
        return Homophone::class;
    }

    public function getActiveWithVariants(): Collection
    {
        return Homophone::with('variants')
            ->where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();
    }

    public function search(string $term): Collection
    {
        return Homophone::with('variants')
            ->where('word', 'like', "%{$term}%")
            ->orWhereHas('variants', function ($q) use ($term) {
                $q->where('variant_word', 'like', "%{$term}%");
            })
            ->orderBy('id', 'asc')
            ->get();
    }

    public function getPaginatedWithSearch(?string $search = null, int $perPage = 10, string $sortBy = 'id', string $sortDir = 'asc', string $hasHomophones = ''): LengthAwarePaginator
    {
        $query = Homophone::with('variants')
            ->where('is_active', true);

        // Search filter
        if ($search && trim($search) !== '') {
            $searchTerm = trim($search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('word', 'like', "%{$searchTerm}%")
                    ->orWhere('pos', 'like', "%{$searchTerm}%")
                    ->orWhere('pro', 'like', "%{$searchTerm}%")
                    ->orWhere('definition', 'like', "%{$searchTerm}%")
                    ->orWhereHas('variants', function ($subQ) use ($searchTerm) {
                        $subQ->where('variant_word', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Filter by has homophones
        if ($hasHomophones === 'yes') {
            $query->has('variants');
        } elseif ($hasHomophones === 'no') {
            $query->doesntHave('variants');
        }

        // Sorting
        $allowedSortFields = ['id', 'word', 'created_at'];
        $sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'id';
        $sortDirection = in_array(strtolower($sortDir), ['asc', 'desc']) ? strtolower($sortDir) : 'asc';
        
        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    public function getWithRelations(int $id): ?Homophone
    {
        return Homophone::with(['variants', 'groups'])->find($id);
    }

    public function createWithVariants(array $data, array $variants): Homophone
    {
        return DB::transaction(function () use ($data, $variants) {
            $homophone = Homophone::create($data);

            if (!empty($variants)) {
                foreach ($variants as $index => $variant) {
                    if (!empty($variant)) {
                        HomophoneVariant::create([
                            'homophone_id' => $homophone->id,
                            'variant_word' => $variant,
                            'sort_order' => $index,
                        ]);
                    }
                }
            }

            return $homophone->load('variants');
        });
    }

    public function updateWithVariants(int $id, array $data, array $variants): bool
    {
        return DB::transaction(function () use ($id, $data, $variants) {
            $homophone = Homophone::findOrFail($id);
            $homophone->update($data);

            // Delete existing variants
            $homophone->variants()->delete();

            // Create new variants
            if (!empty($variants)) {
                foreach ($variants as $index => $variant) {
                    if (!empty($variant)) {
                        HomophoneVariant::create([
                            'homophone_id' => $homophone->id,
                            'variant_word' => $variant,
                            'sort_order' => $index,
                        ]);
                    }
                }
            }

            return true;
        });
    }

    public function bulkImport(array $homophones): array
    {
        $normalize = function($str) {
            return preg_replace('/\s+/u', ' ', trim((string)$str));
        };

        $existingWords = Homophone::pluck('word', 'id')->toArray();
        $imported = 0;
        $skipped = 0;

        DB::transaction(function () use ($homophones, $normalize, &$existingWords, &$imported, &$skipped) {
            foreach ($homophones as $data) {
                $normalized = [
                    'word' => $data['word'] ?? $data['Word'] ?? null,
                    'pos' => $data['pos'] ?? $data['POS'] ?? null,
                    'pro' => $data['pro'] ?? $data['Pronunciation'] ?? null,
                    'definition' => $data['definition'] ?? $data['Definition'] ?? null,
                    'example' => $data['example'] ?? $data['Example'] ?? '',
                    'phoneme' => $data['phoneme'] ?? $data['Phoneme'] ?? '',
                    'homophone' => $data['homophone'] ?? [],
                ];

                if (empty($normalized['word']) || empty($normalized['definition'])) {
                    $skipped++;
                    continue;
                }

                // Check for duplicate
                if (in_array($normalize($normalized['word']), array_map($normalize, $existingWords))) {
                    $skipped++;
                    continue;
                }

                // Convert homophone string to array
                if (is_string($normalized['homophone'])) {
                    $normalized['homophone'] = array_filter(array_map('trim', explode(',', $normalized['homophone'])));
                }

                // Create homophone with variants
                $homophone = Homophone::create([
                    'word' => $normalized['word'],
                    'pronunciation' => $normalized['pro'] ?? $normalized['phoneme'] ?? $normalized['pos'],
                    'definition' => $normalized['definition'],
                    'examples' => $normalized['example'] ? [$normalized['example']] : null,
                    'is_active' => true,
                ]);

                // Create variants
                if (!empty($normalized['homophone']) && is_array($normalized['homophone'])) {
                    foreach ($normalized['homophone'] as $index => $variant) {
                        if (!empty($variant)) {
                            HomophoneVariant::create([
                                'homophone_id' => $homophone->id,
                                'variant_word' => $variant,
                                'sort_order' => $index,
                            ]);
                        }
                    }
                }

                $imported++;
                $existingWords[$homophone->id] = $homophone->word;
            }
        });

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'total' => count($homophones),
        ];
    }

    public function clearAll(): bool
    {
        return DB::transaction(function () {
            HomophoneVariant::query()->delete();
            Homophone::query()->delete();
            return true;
        });
    }

    public function wordExists(string $word): bool
    {
        return Homophone::where('word', $word)->exists();
    }

    public function getByGroup(int $groupId): Collection
    {
        return Homophone::whereHas('groups', function ($query) use ($groupId) {
            $query->where('group_id', $groupId);
        })
        ->with(['variants', 'groups'])
        ->orderBy('word', 'asc')
        ->get();
    }
}

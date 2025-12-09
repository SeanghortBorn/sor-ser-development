<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Homophone extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'homophones';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'word',
        'definition',
        'pronunciation',
        'explanation',
        'examples',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'examples' => 'array',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the variants for this homophone.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(HomophoneVariant::class)->orderBy('sort_order');
    }

    /**
     * Get the groups this homophone belongs to.
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            HomophoneGroup::class,
            'homophone_group_members',
            'homophone_id',
            'group_id'
        )->withTimestamps();
    }

    /**
     * Scope a query to only include active homophones.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to include variants relationship.
     */
    public function scopeWithVariants($query)
    {
        return $query->with('variants');
    }

    /**
     * Scope a query to search by word or variants.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('word', 'like', "%{$term}%")
            ->orWhereHas('variants', function ($q) use ($term) {
                $q->where('variant_word', 'like', "%{$term}%");
            });
    }

    /**
     * Get all variant words as an array (for backward compatibility).
     */
    public function getVariantWordsAttribute(): array
    {
        return $this->variants->pluck('variant_word')->toArray();
    }
}

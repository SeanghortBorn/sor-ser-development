<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomophoneVariant extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'homophone_variants';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'homophone_id',
        'variant_word',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'homophone_id' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the homophone that owns this variant.
     */
    public function homophone(): BelongsTo
    {
        return $this->belongsTo(Homophone::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomophoneGroup extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'homophone_groups';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'group_name',
        'description',
    ];

    /**
     * Get the homophones in this group.
     */
    public function homophones(): BelongsToMany
    {
        return $this->belongsToMany(
            Homophone::class,
            'homophone_group_members',
            'group_id',
            'homophone_id'
        )->withTimestamps();
    }
}

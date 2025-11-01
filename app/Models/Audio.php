<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Audio extends Model
{
    protected $table = 'audios'; // <-- Ensure correct table name

    protected $fillable = [
        'title',
        'file_path',
        'file_size',
        'duration',
    ];

    public function articles()
    {
        return $this->hasMany(Article::class, 'audios_id');
    }
}
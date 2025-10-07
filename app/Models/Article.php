<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\File;
use App\Models\Audio;

class Article extends Model
{
    protected $fillable = [
        'title',
        'user_id',
        'file_id',
        'audios_id',
    ];

    /**
     * Get the file associated with the article.
     */
    public function file()
    {
        return $this->belongsTo(File::class, 'file_id');
    }

    /**
     * Get the audio associated with the article.
     */
    public function audio()
    {
        return $this->belongsTo(Audio::class, 'audios_id');
    }
}

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

    /**
     * Boot method to handle cascading deletes
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($article) {
            // First, nullify the foreign keys to avoid constraint violations
            $article->file_id = null;
            $article->audios_id = null;
            $article->save();

            // Then delete file and audio records if they exist and have no other articles
            if ($article->file) {
                // Only delete if no other articles reference this file
                $fileRefCount = Article::where('file_id', $article->file->id)->count();
                if ($fileRefCount === 0) {
                    $article->file->delete();
                }
            }
            if ($article->audio) {
                // Only delete if no other articles reference this audio
                $audioRefCount = Article::where('audios_id', $article->audio->id)->count();
                if ($audioRefCount === 0) {
                    $article->audio->delete();
                }
            }
        });
    }
}

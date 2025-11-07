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
            // Get file and audio before deletion
            $file = $article->file;
            $audio = $article->audio;

            // Delete file if no other articles reference it
            if ($file) {
                $fileRefCount = Article::where('file_id', $file->id)
                    ->where('id', '!=', $article->id)
                    ->count();
                if ($fileRefCount === 0) {
                    $file->delete();
                }
            }

            // Delete audio if no other articles reference it
            if ($audio) {
                $audioRefCount = Article::where('audios_id', $audio->id)
                    ->where('id', '!=', $article->id)
                    ->count();
                if ($audioRefCount === 0) {
                    $audio->delete();
                }
            }
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAudioActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'audio_id',
        'article_id',
        'grammar_checker_id',
        'activity_type',
        'play_count',
        'rewind_count',
        'forward_count',
        'playback_position',
        'pause_duration',
        'pause_started_at',
        'metadata',
        'session_id',
    ];

    protected $casts = [
        'playback_position' => 'decimal:2',
        'pause_duration' => 'decimal:2',
        'pause_started_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function audio()
    {
        return $this->belongsTo(Audio::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function grammarChecker()
    {
        return $this->belongsTo(GrammarChecker::class);
    }
}

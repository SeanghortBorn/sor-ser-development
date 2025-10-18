<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'grammar_checker_id',
        'article_id',
        'activity_type',
        'character_entered',
        'action',
        'comparison_type',
        'user_word',
        'article_word',
        'word_position',
        'audio_id',
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
        'metadata' => 'array',
        'pause_started_at' => 'datetime',
        'playback_position' => 'decimal:2',
        'pause_duration' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function grammarChecker()
    {
        return $this->belongsTo(GrammarChecker::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function audio()
    {
        return $this->belongsTo(Audio::class);
    }

    // Scopes
    public function scopeTextInput($query)
    {
        return $query->where('activity_type', 'text_input');
    }

    public function scopeComparisonAction($query)
    {
        return $query->where('activity_type', 'comparison_action');
    }

    public function scopeAudioActivity($query)
    {
        return $query->whereIn('activity_type', ['audio_play', 'audio_pause', 'audio_rewind', 'audio_forward']);
    }
}

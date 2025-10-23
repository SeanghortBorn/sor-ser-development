<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserHomophoneAccuracy extends Model
{
    use HasFactory;

    protected $table = 'user_homophone_accuracies';

    protected $fillable = [
        'user_id',
        'grammar_checker_id',
        'article_id',
        'accuracy',
        'replaced_count',
        'extra_count',
        'missing_count',
        'avg_pause_duration',
        'user_word_count',
        'article_total_words',
        'reading_time_seconds',
    ];

    protected $casts = [
        'accuracy' => 'float',
        'avg_pause_duration' => 'float',
        'user_word_count' => 'integer',
        'article_total_words' => 'integer',
        'reading_time_seconds' => 'integer',
    ];
}

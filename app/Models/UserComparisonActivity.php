<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserComparisonActivity extends Model
{
    use HasFactory;

    protected $table = 'user_comparison_activities';

    protected $fillable = [
        'user_id',
        'grammar_checker_id',
        'article_id',
        'action',
        'comparison_type',
        'user_word',
        'article_word',
        'word_position',
        'metadata',
        'session_id',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

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
}

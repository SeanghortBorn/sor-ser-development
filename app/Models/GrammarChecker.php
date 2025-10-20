<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrammarChecker extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'paragraph',
        'word_count',
        'incorrect_word_count',
        'reading_time',
        'article_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'grammar_checker_tag');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'color', 'user_id'];

    public function grammarCheckers()
    {
        return $this->belongsToMany(GrammarChecker::class, 'grammar_checker_tag');
    }
}

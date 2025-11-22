<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTypingActivity extends Model
{
    protected $table = 'user_typing_activities';

    protected $fillable = [
        'grammar_checker_id',
        'user_id',
        'character',
        'status',
    ];

    // NO 'status' => 'boolean' → keeps 0 and 1 as integer
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function grammarChecker() { return $this->belongsTo(GrammarChecker::class); }
}
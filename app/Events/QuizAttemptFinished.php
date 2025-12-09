<?php

namespace App\Events;

use App\Models\QuizAttempt;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuizAttemptFinished
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public QuizAttempt $attempt;
    public int $userId;
    public int $quizId;
    public int $score;
    public float $percentage;

    /**
     * Create a new event instance.
     */
    public function __construct(QuizAttempt $attempt)
    {
        $this->attempt = $attempt;
        $this->userId = $attempt->user_id;
        $this->quizId = $attempt->quiz_id;
        $this->score = $attempt->score;

        $totalQuestions = $attempt->quiz->questions()->count();
        $this->percentage = $totalQuestions > 0 ? ($attempt->score / $totalQuestions) * 100 : 0;
    }
}

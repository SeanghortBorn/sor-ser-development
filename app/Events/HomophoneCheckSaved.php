<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HomophoneCheckSaved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public int $articleId;
    public float $accuracy;
    public int $totalWords;
    public int $correctWords;
    public int $incorrectWords;
    public array $metrics;

    /**
     * Create a new event instance.
     */
    public function __construct(
        int $userId,
        int $articleId,
        float $accuracy,
        int $totalWords,
        int $correctWords,
        int $incorrectWords,
        array $metrics = []
    ) {
        $this->userId = $userId;
        $this->articleId = $articleId;
        $this->accuracy = $accuracy;
        $this->totalWords = $totalWords;
        $this->correctWords = $correctWords;
        $this->incorrectWords = $incorrectWords;
        $this->metrics = $metrics;
    }
}

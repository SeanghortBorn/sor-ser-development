<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArticleCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public int $articleId;
    public float $accuracy;
    public array $completionData;

    /**
     * Create a new event instance.
     */
    public function __construct(int $userId, int $articleId, float $accuracy, array $completionData = [])
    {
        $this->userId = $userId;
        $this->articleId = $articleId;
        $this->accuracy = $accuracy;
        $this->completionData = $completionData;
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserProgressUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public string $progressType;
    public array $data;

    /**
     * Create a new event instance.
     *
     * @param int $userId
     * @param string $progressType (article, quiz, homophone, typing)
     * @param array $data
     */
    public function __construct(int $userId, string $progressType, array $data = [])
    {
        $this->userId = $userId;
        $this->progressType = $progressType;
        $this->data = $data;
    }
}

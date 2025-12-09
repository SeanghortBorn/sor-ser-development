<?php

namespace App\Listeners;

use App\Events\ArticleCompleted;
use App\Models\User;
use App\Models\Article;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendCompletionEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ArticleCompleted $event): void
    {
        $user = User::find($event->userId);
        $article = Article::find($event->articleId);

        if (!$user || !$article) {
            return;
        }

        // Only send email for high accuracy completions (80%+)
        if ($event->accuracy >= 80) {
            // TODO: Create mail class and uncomment
            // Mail::to($user->email)->send(new ArticleCompletionMail($user, $article, $event->accuracy));

            \Log::info('Article completion email queued', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'article_id' => $article->id,
                'article_title' => $article->title,
                'accuracy' => $event->accuracy,
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(ArticleCompleted $event, \Throwable $exception): void
    {
        \Log::error('SendCompletionEmail listener failed', [
            'user_id' => $event->userId,
            'article_id' => $event->articleId,
            'error' => $exception->getMessage(),
        ]);
    }
}

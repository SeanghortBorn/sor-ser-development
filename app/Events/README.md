# Event-Driven Architecture Documentation

## Overview

This application uses Laravel's event-driven architecture to decouple business logic and enable asynchronous processing. Events are dispatched when significant actions occur, and listeners respond to these events.

## Events

### ArticleCompleted
Dispatched when a user completes an article.

**Properties:**
- `userId`: int - The user who completed the article
- `articleId`: int - The completed article ID
- `accuracy`: float - Completion accuracy percentage
- `completionData`: array - Additional completion data

**Listeners:**
- `UpdateUserProgress` - Saves completion to database
- `UnlockNextArticle` - Checks and unlocks the next article
- `SendCompletionEmail` - Sends congratulations email (if accuracy >= 80%)

**Usage:**
```php
use App\Events\ArticleCompleted;

event(new ArticleCompleted(
    userId: auth()->id(),
    articleId: $article->id,
    accuracy: 85.5,
    completionData: [
        'time_spent' => 300,
        'attempts' => 1,
    ]
));
```

### QuizAttemptFinished
Dispatched when a user finishes a quiz attempt.

**Properties:**
- `attempt`: QuizAttempt - The quiz attempt model
- `userId`: int - The user ID
- `quizId`: int - The quiz ID
- `score`: int - Score achieved
- `percentage`: float - Score percentage

**Listeners:**
- `UpdateUserProgress` - Updates user cache

**Usage:**
```php
use App\Events\QuizAttemptFinished;

$attempt = QuizAttempt::create([...]);
event(new QuizAttemptFinished($attempt));
```

### HomophoneCheckSaved
Dispatched when a user completes a homophone check.

**Properties:**
- `userId`: int
- `articleId`: int
- `accuracy`: float
- `totalWords`: int
- `correctWords`: int
- `incorrectWords`: int
- `metrics`: array

**Listeners:**
- `UpdateUserProgress` - Saves homophone accuracy to database

**Usage:**
```php
use App\Events\HomophoneCheckSaved;

event(new HomophoneCheckSaved(
    userId: auth()->id(),
    articleId: $article->id,
    accuracy: 92.5,
    totalWords: 100,
    correctWords: 93,
    incorrectWords: 7,
    metrics: ['time_spent' => 450]
));
```

### UserProgressUpdated
Dispatched when any user progress changes.

**Properties:**
- `userId`: int
- `progressType`: string - Type of progress (article, quiz, homophone, typing)
- `data`: array - Additional data

**Listeners:**
- `RecalculateAnalytics` - Dispatches job to recalculate analytics

**Usage:**
```php
use App\Events\UserProgressUpdated;

event(new UserProgressUpdated(
    userId: auth()->id(),
    progressType: 'article',
    data: ['article_id' => 5]
));
```

## Jobs

### ProcessArticleCompletion
Processes article completion asynchronously.

**Usage:**
```php
use App\Jobs\ProcessArticleCompletion;

ProcessArticleCompletion::dispatch(
    userId: auth()->id(),
    articleId: $article->id,
    completionData: [
        'accuracy' => 85.5,
        'time_spent' => 300,
    ]
);
```

### CalculateUserAnalytics
Recalculates and caches user analytics.

**Usage:**
```php
use App\Jobs\CalculateUserAnalytics;

CalculateUserAnalytics::dispatch(userId: auth()->id());
```

### SendProgressReport
Sends weekly or monthly progress report to user.

**Usage:**
```php
use App\Jobs\SendProgressReport;

SendProgressReport::dispatch(
    userId: auth()->id(),
    reportType: 'weekly' // or 'monthly'
);
```

### ExportAnalyticsData
Exports analytics data to JSON file.

**Usage:**
```php
use App\Jobs\ExportAnalyticsData;

// Export all student analytics
ExportAnalyticsData::dispatch('students');

// Export platform stats
ExportAnalyticsData::dispatch('platform');

// Export specific user analytics
ExportAnalyticsData::dispatch('user', [], $userId);
```

## Console Commands

### Warm Cache
Pre-populate cache with frequently accessed data.

```bash
php artisan cache:warm
```

**Schedule in app/Console/Kernel.php:**
```php
$schedule->command('cache:warm')->daily();
```

### Send Weekly Reports
Send weekly progress reports to all active students.

```bash
# Send to all students
php artisan reports:send-weekly

# Send to specific user
php artisan reports:send-weekly --user-id=123
```

**Schedule in app/Console/Kernel.php:**
```php
$schedule->command('reports:send-weekly')->weekly()->mondays()->at('08:00');
```

## Best Practices

1. **Always dispatch events after database transactions complete**
   ```php
   DB::transaction(function () {
       // Save to database
       $completion = UserArticleCompletion::create([...]);
   });

   // Dispatch event AFTER transaction commits
   event(new ArticleCompleted(...));
   ```

2. **Use jobs for time-consuming tasks**
   ```php
   // Instead of processing immediately
   ProcessArticleCompletion::dispatch(...);

   // Return response quickly
   return response()->json(['success' => true]);
   ```

3. **Handle failures gracefully**
   All listeners and jobs implement `failed()` methods that log errors.

4. **Queue configuration**
   Ensure your `.env` has queue driver configured:
   ```
   QUEUE_CONNECTION=database
   ```

   Then run the queue worker:
   ```bash
   php artisan queue:work
   ```

## Testing Events

```php
use Illuminate\Support\Facades\Event;
use App\Events\ArticleCompleted;

Event::fake();

// Your code that dispatches events
event(new ArticleCompleted(...));

// Assert event was dispatched
Event::assertDispatched(ArticleCompleted::class, function ($event) {
    return $event->userId === 1 && $event->articleId === 5;
});
```

## Monitoring

All events and jobs log their execution. Check logs at:
- `storage/logs/laravel.log`

Monitor failed jobs:
```bash
php artisan queue:failed
```

Retry failed jobs:
```bash
php artisan queue:retry all
```

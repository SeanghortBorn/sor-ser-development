<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;

class QuizService
{
    /**
     * Get all quizzes with questions count.
     */
    public function getAllWithQuestionCount(): Collection
    {
        return Quiz::withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a single quiz with its questions.
     */
    public function getWithQuestions(int $quizId): ?Quiz
    {
        return Quiz::with('questions')->find($quizId);
    }

    /**
     * Get active quizzes only.
     */
    public function getActiveQuizzes(): Collection
    {
        return Quiz::where('status', 'active')
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new quiz.
     */
    public function create(array $data): Quiz
    {
        return Quiz::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'groups' => $data['groups'] ?? [],
            'status' => $data['status'] ?? 'draft',
        ]);
    }

    /**
     * Update an existing quiz.
     */
    public function update(int $quizId, array $data): bool
    {
        $quiz = Quiz::findOrFail($quizId);

        return $quiz->update([
            'title' => $data['title'] ?? $quiz->title,
            'description' => $data['description'] ?? $quiz->description,
            'groups' => $data['groups'] ?? $quiz->groups,
            'status' => $data['status'] ?? $quiz->status,
        ]);
    }

    /**
     * Delete a quiz.
     */
    public function delete(int $quizId): bool
    {
        $quiz = Quiz::findOrFail($quizId);
        return $quiz->delete();
    }

    /**
     * Submit a quiz attempt.
     */
    public function submitAttempt(int $userId, int $quizId, array $answers): QuizAttempt
    {
        $quiz = Quiz::with('questions')->findOrFail($quizId);
        $score = $this->calculateScore($quiz, $answers);

        return QuizAttempt::create([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'answers' => $answers,
            'score' => $score,
        ]);
    }

    /**
     * Calculate quiz score based on answers.
     */
    protected function calculateScore(Quiz $quiz, array $answers): int
    {
        $score = 0;

        foreach ($quiz->questions as $question) {
            $userAnswer = $answers[$question->id] ?? null;
            $correctAnswer = $question->correct_answer;

            if ($userAnswer !== null && $userAnswer == $correctAnswer) {
                $score++;
            }
        }

        return $score;
    }

    /**
     * Get user's quiz attempts.
     */
    public function getUserAttempts(int $userId, ?int $quizId = null): Collection
    {
        $query = QuizAttempt::with('quiz')
            ->where('user_id', $userId);

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get quiz statistics.
     */
    public function getQuizStats(int $quizId): array
    {
        $quiz = Quiz::with('attempts')->findOrFail($quizId);
        $attempts = $quiz->attempts;

        if ($attempts->isEmpty()) {
            return [
                'total_attempts' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
            ];
        }

        $totalQuestions = $quiz->questions()->count();
        $scores = $attempts->pluck('score');
        $percentages = $scores->map(function ($score) use ($totalQuestions) {
            return $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;
        });

        return [
            'total_attempts' => $attempts->count(),
            'average_score' => round($scores->avg(), 2),
            'average_percentage' => round($percentages->avg(), 2),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'pass_rate' => round($percentages->filter(fn($p) => $p >= 70)->count() / $attempts->count() * 100, 2),
        ];
    }

    /**
     * Check if user has completed a quiz.
     */
    public function hasUserCompletedQuiz(int $userId, int $quizId): bool
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->exists();
    }

    /**
     * Get user's best attempt for a quiz.
     */
    public function getUserBestAttempt(int $userId, int $quizId): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->orderBy('score', 'desc')
            ->first();
    }

    /**
     * Format quiz attempt data for frontend.
     */
    public function formatAttemptForFrontend(QuizAttempt $attempt): array
    {
        $totalQuestions = $attempt->quiz->questions()->count();
        $percentage = $totalQuestions > 0 ? ($attempt->score / $totalQuestions) * 100 : 0;

        return [
            'id' => $attempt->id,
            'quiz_id' => $attempt->quiz_id,
            'quiz_title' => $attempt->quiz->title,
            'score' => $attempt->score,
            'total_questions' => $totalQuestions,
            'percentage' => round($percentage, 2),
            'passed' => $percentage >= 70,
            'answers' => $attempt->answers,
            'created_at' => $attempt->created_at,
        ];
    }
}

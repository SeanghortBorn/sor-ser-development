<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes for admin (Inertia view)
     */
    public function index(Request $request): Response
    {
        $rsDatas = Quiz::with('questions')
            ->latest()
            ->paginate(10)
            ->appends($request->query());

        return Inertia::render('Quizzes/Index', [
            'quizData' => $rsDatas
        ]);
    }

    /**
     * Display quizzes for landing page (frontend students)
     */
    public function landingPage(): Response
    {
        $quizzes = Quiz::with('questions')
            ->where('status', 'Published')
            ->orderBy('created_at', 'desc')
            ->get();

        $quizzes->each(function ($quiz) {
            $quiz->questions->each(function ($q) {
                $q->correct_answer = $this->safeDecode($q->correct_answer);
                $q->options = $this->safeDecode($q->options);
            });
        });

        // Dynamic metrics for QuizzesSection
        $userId = Auth::id();
        $totalQuizzes = $quizzes->count();

        // Completed = distinct quizzes attempted by the user
        $completedCount = $userId
            ? QuizAttempt::where('user_id', $userId)->distinct('quiz_id')->count('quiz_id')
            : 0;
        // In progress = available - completed (best-effort approximation)
        $inProgressCount = max(0, $totalQuizzes - $completedCount);

        // 7-day series: completed per day; inProgress approximated per day
        $days = collect(range(6, 0))->map(function ($i) {
            return Carbon::now()->subDays($i)->startOfDay();
        });
        $quizDaily = $days->map(function (Carbon $day) use ($userId, $totalQuizzes) {
            $end = $day->copy()->endOfDay();
            $attemptsQ = $userId
                ? QuizAttempt::where('user_id', $userId)->whereBetween('created_at', [$day, $end])
                : QuizAttempt::whereRaw('1=0');
            $completed = $userId ? (int) $attemptsQ->count() : 0;
            $avgScore = $userId ? round((float) ($attemptsQ->avg('score') ?? 0), 2) : 0.0;
            $inProg = max(0, $totalQuizzes - $completed);
            return [
                'day' => $day->format('D'),
                'completed' => $completed,
                'inProgress' => $inProg,
                'avgScore' => $avgScore,
            ];
        })->values();

        // Recent attempts
        $recentQuizzes = $userId
            ? QuizAttempt::with('quiz')
                ->where('user_id', $userId)
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => '#' . str_pad((string) $a->id, 5, '0', STR_PAD_LEFT),
                        'date' => optional($a->created_at)->format('M d, Y'),
                        'status' => 'Complete',
                        'color' => ($a->score ?? 0) >= 60 ? 'green' : 'yellow',
                        'title' => $a->quiz->title ?? 'Quiz',
                        'score' => (int) ($a->score ?? 0),
                    ];
                })
            : [];

        // Avg score over last 7 days
        $since = Carbon::now()->subDays(6)->startOfDay();
        $avgScore7d = $userId
            ? round((float) (QuizAttempt::where('user_id', $userId)
                ->where('created_at', '>=', $since)
                ->avg('score') ?? 0), 2)
            : 0.0;

        // Per-quiz trends and changes over last 7 days
        $today = Carbon::now()->startOfDay();
        $yesterday = Carbon::now()->subDay()->startOfDay();
        $quizChange = $quizzes->map(function ($q) use ($userId, $days, $today, $yesterday) {
            // Build 7-day trend for this quiz
            $trend = $days->map(function (Carbon $day) use ($q, $userId) {
                $end = $day->copy()->endOfDay();
                $count = $userId
                    ? QuizAttempt::where('user_id', $userId)
                        ->where('quiz_id', $q->id)
                        ->whereBetween('created_at', [$day, $end])
                        ->count()
                    : 0;
                return [
                    'day' => $day->format('D'),
                    'count' => (int) $count,
                ];
            })->values();

            $first = $trend->first()['count'] ?? 0;
            $last = $trend->last()['count'] ?? 0;
            $den = max(1, $first);
            $change7d = ($first === 0 && $last > 0) ? 100 : (int) round((($last - $first) / $den) * 100);

            // Today / Yesterday counts
            $todayCount = $userId ? QuizAttempt::where('user_id', $userId)
                ->where('quiz_id', $q->id)
                ->whereBetween('created_at', [$today, $today->copy()->endOfDay()])
                ->count() : 0;
            $yesterdayCount = $userId ? QuizAttempt::where('user_id', $userId)
                ->where('quiz_id', $q->id)
                ->whereBetween('created_at', [$yesterday, $yesterday->copy()->endOfDay()])
                ->count() : 0;

            return [
                'quiz_id' => $q->id,
                'title' => $q->title,
                'today' => (int) $todayCount,
                'yesterday' => (int) $yesterdayCount,
                'changePercent7d' => $change7d,
                'trend7d' => $trend,
            ];
        })->sortByDesc('changePercent7d')->values();

        return Inertia::render('Quizzes/DoQuiz', [
            'quizData' => ['data' => $quizzes],
            'quizSummary' => [
                'total' => $totalQuizzes,
                'completed' => $completedCount,
                'inProgress' => $inProgressCount,
                'avgScore7d' => $avgScore7d,
            ],
            'quizDaily' => $quizDaily,
            'recentQuizzes' => $recentQuizzes,
            'quizChange' => $quizChange,
        ]);
    }

    /**
     * Show the form for creating a new quiz
     */
    public function create()
    {
        return Inertia::render('Quizzes/CreateEdit', [
            'datas' => ''
        ]);
    }

    /**
     * Store a newly created quiz
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|max:255|min:2',
            'description' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'required|in:Draft,Published',
            'questions' => 'nullable|array',
        ]);

        $quiz = Quiz::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'groups' => $data['groups'] ?? [],
            'status' => $data['status'],
        ]);

        $this->saveQuestions($quiz, $data['questions'] ?? []);

        return redirect()->route('quizzes.index');
    }

    /**
     * Show quiz edit form
     */
    public function edit($id)
    {
        $quiz = Quiz::with('questions')->findOrFail($id);

        $quiz->questions->each(function ($q) {
            $q->correct_answer = $this->safeDecode($q->correct_answer);
            $q->options = $this->safeDecode($q->options);
        });

        return Inertia::render('Quizzes/CreateEdit', [
            'datas' => $quiz
        ]);
    }

    /**
     * Update an existing quiz
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'title' => 'required|max:255|min:2',
            'description' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'required|in:Draft,Published',
            'questions' => 'nullable|array',
        ]);

        $quiz = Quiz::findOrFail($id);
        $quiz->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'groups' => $data['groups'] ?? [],
            'status' => $data['status'],
        ]);

        // Delete old questions and insert new ones
        $quiz->questions()->delete();
        $this->saveQuestions($quiz, $data['questions'] ?? []);

        return redirect()->route('quizzes.index');
    }

    /**
     * Delete a quiz
     */
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return back()->with('message', 'Deleted successfully');
    }

    /**
     * Display a single quiz for user
     */
    public function show($id)
    {
        $quiz = Quiz::with('questions')
            ->where('status', 'Published')
            ->findOrFail($id);

        $quiz->questions->each(function ($q) {
            $q->correct_answer = $this->safeDecode($q->correct_answer);
            $q->options = $this->safeDecode($q->options);
        });

        return response()->json($quiz);
    }

    /**
     * Handle quiz submission
     */
    public function submitAttempt(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'score' => 'required|integer|min:0',
            'answers' => 'required|array',
        ]);

        $attempt = QuizAttempt::create([
            'user_id' => Auth::id(),
            'quiz_id' => $request->quiz_id,
            'score' => $request->score,
            'answers' => json_encode($request->answers),
        ]);

        // Redirect to the result page
        return redirect()->route('quizzes.result', ['attempt' => $attempt->id]);
    }

    /**
     * Show the result page
     */
    public function showResult(QuizAttempt $attempt)
    {
        $quiz = Quiz::with('questions')->findOrFail($attempt->quiz_id);

        $quiz->questions->each(function ($q) {
            $q->correct_answer = $this->safeDecode($q->correct_answer);
            $q->options = $this->safeDecode($q->options);
        });

        $answers = json_decode($attempt->answers, true);

        return Inertia::render('Quizzes/QuizResult', [
            'quiz' => $quiz,
            'attempt' => $attempt,
            'answers' => $answers,
        ]);
    }
    public function analyse()
    {
        // Get all quiz attempts with user info
        $attempts = QuizAttempt::with('user', 'quiz.questions')->get();

        $analysisData = $attempts->map(function ($attempt) {
            $answers = json_decode($attempt->answers, true) ?? [];
            $quiz = $attempt->quiz;
            $totalQuestions = $quiz->questions->count();
            $correctCount = 0;

            foreach ($quiz->questions as $index => $question) {
                $questionCorrect = json_decode($question->correct_answer, true);
                $userAnswer = $answers[$index]['answer'] ?? null;

                switch ($question->type) {
                    case 'Checkboxes':
                        if (is_array($userAnswer) && is_array($questionCorrect)) {
                            sort($userAnswer);
                            sort($questionCorrect);
                            if ($userAnswer === $questionCorrect) $correctCount++;
                        }
                        break;
                    case 'Matching':
                        if (is_array($userAnswer) && is_array($questionCorrect)) {
                            if ($userAnswer === $questionCorrect) $correctCount++;
                        }
                        break;
                    case 'True/False':
                    case 'Multiple Choice':
                    case 'Fill-in-the-blank':
                        if ($userAnswer == $questionCorrect) $correctCount++;
                        break;
                }
            }

            return [
                'user_id' => $attempt->user_id,
                'user_name' => $attempt->user->name ?? 'Unknown',
                'quiz_id' => $attempt->quiz_id,
                'quiz_title' => $quiz->title ?? 'Unknown Quiz',
                'total_questions' => $totalQuestions,
                'correct' => $correctCount,
                'incorrect' => $totalQuestions - $correctCount,
                'percentage' => $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 2) : 0,
                'attempted_at' => $attempt->created_at,
            ];
        });

        return Inertia::render('Analytics/AnalyticsSection', [
            'quizAnalysis' => $analysisData,
        ]);
    }


    /**
     * Helper to save questions
     */
    /**
     * Helper to save questions
     */
    private function saveQuestions(Quiz $quiz, array $questions)
    {
        foreach ($questions as $i => $q) {
            $options = $q['options'] ?? [];

            switch ($q['type']) {
                case 'Checkboxes':
                    $correct = $q['correct_answer'] ?? [];
                    if (!is_array($correct)) $correct = $correct ? [$correct] : [];
                    $correct = json_encode($correct);
                    $options = json_encode($options);
                    break;

                case 'True/False':
                    $correct = ($q['correct_answer'] === "True" || $q['correct_answer'] === true) ? "True" : "False";
                    $options = json_encode($options);
                    break;

                case 'Matching':
                    // Always sync correct_answer with options
                    $correct = $options;
                    $correct = json_encode($correct ?? []);
                    $options = json_encode($options ?? []);
                    break;

                default:
                    $correct = $q['correct_answer'] ? (string)$q['correct_answer'] : null;
                    $options = json_encode($options);
            }

            $quiz->questions()->create([
                'type' => $q['type'],
                'text' => $q['text'],
                'options' => $options,
                'correct_answer' => $correct,
                'order' => $i,
            ]);
        }
    }

    /**
     * Safe decode helper
     */
    private function safeDecode($data)
    {
        if (is_array($data)) return $data;
        if (empty($data)) return [];
        $decoded = json_decode($data, true);
        return $decoded !== null ? $decoded : $data;
    }
}

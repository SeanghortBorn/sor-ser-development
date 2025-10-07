<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

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

        return Inertia::render('Quizzes/DoQuiz', [
            'quizData' => ['data' => $quizzes]
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
    private function saveQuestions(Quiz $quiz, array $questions)
    {
        foreach ($questions as $i => $q) {
            $correct = $q['correct_answer'] ?? null;
            $options = $q['options'] ?? [];

            switch ($q['type']) {
                case 'Checkboxes':
                    if (!is_array($correct)) $correct = $correct ? [$correct] : [];
                    $correct = json_encode($correct);
                    $options = json_encode($options);
                    break;

                case 'True/False':
                    $correct = ($correct === "True" || $correct === true) ? "True" : "False";
                    $options = json_encode($options);
                    break;

                case 'Matching':
                    $correct = json_encode($correct ?? []);
                    $options = json_encode($options ?? []);
                    break;

                default:
                    $correct = $correct ? (string)$correct : null;
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

<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

        // Decode correct_answer and options safely
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
            'subject' => 'required|max:255',
            'description' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'required|in:Draft,Published',
            'questions' => 'nullable|array',
        ]);

        $quiz = Quiz::create([
            'title' => $data['title'],
            'subject' => $data['subject'],
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

        // Decode options + correct answers safely for editing
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
            'subject' => 'required|max:255',
            'description' => 'nullable|string',
            'groups' => 'nullable|array',
            'status' => 'required|in:Draft,Published',
            'questions' => 'nullable|array',
        ]);

        $quiz = Quiz::findOrFail($id);
        $quiz->update([
            'title' => $data['title'],
            'subject' => $data['subject'],
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

        // Decode safely
        $quiz->questions->each(function ($q) {
            $q->correct_answer = $this->safeDecode($q->correct_answer);
            $q->options = $this->safeDecode($q->options);
        });

        return response()->json($quiz);
    }

    /**
     * Save questions helper
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
                    // Fix: Save "True" or "False" as string, not boolean
                    $correct = ($correct === "True" || $correct === true) ? "True" : "False";
                    $options = json_encode($options);
                    break;

                case 'Matching':
                    // Expect structure: options = [ {left: "", right: ""}, ... ]
                    $correct = json_encode($correct ?? []);
                    $options = json_encode($options ?? []);
                    break;

                default:
                    // Multiple Choice or Fill-in-the-blank
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

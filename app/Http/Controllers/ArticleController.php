<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Audio;
use App\Models\File;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\FileUploadService;
use App\Services\KhmerTextService;
use App\Http\Requests\Article\StoreArticleRequest;
use App\Http\Requests\Article\UpdateArticleRequest;

class ArticleController extends Controller
{
    public function __construct(
        protected FileUploadService $fileUploadService,
        protected KhmerTextService $khmerTextService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Article::with(['file', 'audio']);
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%$search%")
                ->orWhereHas('file', function ($q) use ($search) {
                    $q->where('title', 'like', "%$search%");
                });
        }
        $rsDatas = $query->latest()->paginate(10)->appends($request->only('search'));
        return Inertia::render('Articles/Index', [
            'articles' => $rsDatas,
            'search' => $request->input('search', ''),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Articles/CreateEdit', [
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreArticleRequest $request, Article $model)
    {
        $validated = $request->validated();
        $validated['user_id'] = Auth::user()->id;

        try {
            // Handle file upload
            if ($request->hasFile('file')) {
                $uploadedFile = $request->file('file');

                // Calculate Khmer word count for text files
                $wordCount = $this->khmerTextService->countKhmerWordsFromFile(
                    $uploadedFile->getRealPath(),
                    $uploadedFile->getClientMimeType()
                );

                $fileModel = $this->fileUploadService->uploadFile($uploadedFile, 'files', $wordCount);
                $validated['file_id'] = $fileModel->id;
            } else {
                return back()->withErrors(['file' => 'No file uploaded.']);
            }

            // Handle audio upload
            if ($request->hasFile('audio')) {
                $audioModel = $this->fileUploadService->uploadAudio($request->file('audio'), 'audios');
                $validated['audios_id'] = $audioModel->id;
            } else {
                return back()->withErrors(['audio' => 'No audio uploaded.']);
            }

            $model->create($validated);

            return redirect()->route('articles.index')->with('message', 'Article created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating article', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to create article: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Article $article, $id)
    {
        $rsDatasModel = Article::with(['file', 'audio'])->find($id);
        return Inertia::render('Articles/CreateEdit', [
            'datas' => $rsDatasModel,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArticleRequest $request, $id)
    {
        $article = Article::findOrFail($id);
        $validated = $request->validated();

        try {
            $article->title = $validated['title'];

            // Replace or create file
            if ($request->hasFile('file')) {
                $uploadedFile = $request->file('file');

                // Calculate Khmer word count for text files
                $wordCount = $this->khmerTextService->countKhmerWordsFromFile(
                    $uploadedFile->getRealPath(),
                    $uploadedFile->getClientMimeType()
                );

                $fileModel = $this->fileUploadService->replaceFile(
                    $article->file,
                    $uploadedFile,
                    'files',
                    $wordCount
                );

                $article->file_id = $fileModel->id;
            }

            // Replace or create audio
            if ($request->hasFile('audio')) {
                $audioModel = $this->fileUploadService->replaceAudio(
                    $article->audio,
                    $request->file('audio'),
                    'audios'
                );

                $article->audios_id = $audioModel->id;
            }

            $article->save();
            return redirect()->route('articles.index')->with('message', 'Article updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating article', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update article: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article, $id)
    {
        $article = Article::with(['file', 'audio'])->find($id);
        
        if (!$article) {
            return back()->with('error', 'Article not found');
        }

        try {
            // Store file/audio info before deleting article
            $fileId = $article->file_id;
            $audioId = $article->audios_id;
            $file = $article->file;
            $audio = $article->audio;

            // Delete the article (boot method will handle cascading deletes)
            $article->delete();

            // Delete physical files from storage only if they were actually deleted from DB
            if ($file && $fileId) {
                $fileStillExists = File::find($fileId);
                if (!$fileStillExists && Storage::disk('public')->exists($file->file_path)) {
                    Storage::disk('public')->delete($file->file_path);
                }
            }

            if ($audio && $audioId) {
                $audioStillExists = Audio::find($audioId);
                if (!$audioStillExists && Storage::disk('public')->exists($audio->file_path)) {
                    Storage::disk('public')->delete($audio->file_path);
                }
            }

            return back()->with('message', 'Article and related files deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete article: ' . $e->getMessage()]);
        }
    }

    /**
     * Return articles as JSON for API consumers.
     */
    public function apiList(Request $request)
    {
        // Return articles with audio and file relations
        $articles = Article::with(['audio', 'file'])
            ->orderBy('id', 'desc')
            ->get();

        // Ensure file_path sent to frontend is a public URL (prefixed with /storage/...)
        $articles->transform(function ($article) {
            if ($article->audio && !empty($article->audio->file_path)) {
                $article->audio->file_path = asset('storage/' . ltrim($article->audio->file_path, '/'));
            }
            if ($article->file && !empty($article->file->file_path)) {
                $article->file->file_path = asset('storage/' . ltrim($article->file->file_path, '/'));
            }
            return $article;
        });

        return response()->json($articles);
    }

    /**
     * Get audio details for an article.
     */
    public function getAudio($id)
    {
        $audio = Audio::findOrFail($id);

        // Provide a public URL so frontend audio src resolves to /storage/uploads/...
        $publicPath = $audio->file_path
            ? asset('storage/' . ltrim($audio->file_path, '/'))
            : null;

        return response()->json([
            'data' => [
                'id' => $audio->id,
                'title' => $audio->title,
                'file_path' => $publicPath,
                'duration' => $audio->duration
            ]
        ]);
    }

    /**
     * Show completion stats for a specific article.
     * Displays which users completed/not completed the article.
     */
    public function completionStats($id)
    {
        $article = Article::findOrFail($id);

        // Get all users with their roles
        $users = \App\Models\User::with('roles')
            ->select('id', 'name', 'email', 'created_at')
            ->get();

        // Get all completions for this article
        $completions = \App\Models\UserArticleCompletion::where('article_id', $id)
            ->select('user_id', 'accuracy', 'typing_speed', 'created_at', 'best_accuracy')
            ->get()
            ->keyBy('user_id');

        // Map users with their completion status
        $userStats = $users->map(function ($user) use ($completions) {
            $completion = $completions->get($user->id);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? 'Student',
                'has_completed' => $completion !== null,
                'accuracy' => $completion?->accuracy,
                'best_accuracy' => $completion?->best_accuracy,
                'typing_speed' => $completion?->typing_speed,
                'completed_at' => $completion?->created_at?->format('Y-m-d H:i:s'),
                'member_since' => $user->created_at?->format('Y-m-d'),
            ];
        });

        // Separate completed and not completed users
        $completed = $userStats->filter(fn($u) => $u['has_completed'])->values();
        $notCompleted = $userStats->filter(fn($u) => !$u['has_completed'])->values();

        return Inertia::render('Articles/CompletionStats', [
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
            ],
            'stats' => [
                'total_users' => $users->count(),
                'completed_count' => $completed->count(),
                'not_completed_count' => $notCompleted->count(),
                'completion_rate' => $users->count() > 0
                    ? round(($completed->count() / $users->count()) * 100, 1)
                    : 0,
            ],
            'completed_users' => $completed,
            'not_completed_users' => $notCompleted,
        ]);
    }
}
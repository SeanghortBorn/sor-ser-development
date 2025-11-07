<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Audio;
use App\Models\File;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use \Illuminate\Support\Facades\Auth;

class ArticleController extends Controller
{
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
    public function store(Request $request, Article $model)
    {
        $validated = $request->validate([
            'title' => 'required|max:255|min:2',
            'file' => 'required|file|max:10240|mimes:txt,pdf,doc,docx',
            'audio' => 'required|file|max:20480|mimes:mp3,wav,m4a,ogg',
        ], [
            'file.max' => 'File size must not exceed 10 MB.',
            'file.mimes' => 'File must be a txt, pdf, doc, or docx file.',
            'audio.max' => 'Audio file size must not exceed 20 MB.',
            'audio.mimes' => 'Audio must be mp3, wav, m4a, or ogg format.',
            'title.required' => 'Title is required.',
            'title.min' => 'Title must be at least 2 characters.',
            'title.max' => 'Title must not exceed 255 characters.',
        ]);
        $validated['user_id'] = Auth::user()->id;

        try {
            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                if ($file->getSize() === 0) {
                    return back()->withErrors(['file' => 'Uploaded file is empty.']);
                }
                
                $fileModel = new File();
                $fileModel->title = $file->getClientOriginalName();
                $storedPath = $file->store('uploads/files', 'public');
                $fileModel->file_path = $storedPath;
                $fileModel->file_size = $file->getSize();
                $fileModel->file_type = $file->getClientMimeType();

                $wordCount = 0;
                if ($fileModel->file_type === 'text/plain') {
                    $fileContent = file_get_contents($file->getRealPath());
                    $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                    foreach ($tokens as $token) {
                        if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                            $wordCount++;
                        }
                    }
                }
                $fileModel->word_count = $wordCount;
                $fileModel->save();
                $validated['file_id'] = $fileModel->id;
            } else {
                return back()->withErrors(['file' => 'No file uploaded.']);
            }

            // Handle audio upload
            if ($request->hasFile('audio')) {
                $audio = $request->file('audio');
                if ($audio->getSize() === 0) {
                    return back()->withErrors(['audio' => 'Uploaded audio is empty.']);
                }
                
                $audioModel = new Audio();
                $audioModel->title = $audio->getClientOriginalName();
                $storedPath = $audio->store('uploads/audios', 'public');
                $audioModel->file_path = $storedPath;
                $audioModel->file_size = $audio->getSize();
                $audioModel->duration = 0;
                $audioModel->save();
                $validated['audios_id'] = $audioModel->id;
            } else {
                return back()->withErrors(['audio' => 'No audio uploaded.']);
            }

            $model->create($validated);
            return redirect()->route('articles.index')->with('message', 'Article created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create article: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article, $id)
    {
        //
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
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:txt,pdf,doc,docx',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a,ogg',
        ], [
            'file.max' => 'File size must not exceed 10 MB.',
            'file.mimes' => 'File must be a txt, pdf, doc, or docx file.',
            'audio.max' => 'Audio file size must not exceed 20 MB.',
            'audio.mimes' => 'Audio must be mp3, wav, m4a, or ogg format.',
            'title.required' => 'Title is required.',
            'title.max' => 'Title must not exceed 255 characters.',
        ]);

        try {
            $article->title = $validated['title'];

            // Replace or create file
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                if ($article->file) {
                    // Delete old physical file from storage
                    if (Storage::disk('public')->exists($article->file->file_path)) {
                        Storage::disk('public')->delete($article->file->file_path);
                    }
                    // Update existing file row
                    $storedPath = $file->store('uploads/files', 'public');
                    $fileType = $file->getClientMimeType();
                    $wordCount = 0;
                    if ($fileType === 'text/plain') {
                        $fileContent = file_get_contents($file->getRealPath());
                        $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                        foreach ($tokens as $token) {
                            if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                                $wordCount++;
                            }
                        }
                    }
                    $article->file->update([
                        'title' => $file->getClientOriginalName(),
                        'file_path' => $storedPath,
                        'file_size' => $file->getSize(),
                        'file_type' => $fileType,
                        'word_count' => $wordCount,
                    ]);
                } else {
                    // Create new file row and link
                    $fileModel = new File();
                    $fileModel->title = $file->getClientOriginalName();
                    $storedPath = $file->store('uploads/files', 'public');
                    $fileModel->file_path = $storedPath;
                    $fileModel->file_size = $file->getSize();
                    $fileModel->file_type = $file->getClientMimeType();
                    $wordCount = 0;
                    if ($fileModel->file_type === 'text/plain') {
                        $fileContent = file_get_contents($file->getRealPath());
                        $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                        foreach ($tokens as $token) {
                            if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                                $wordCount++;
                            }
                        }
                    }
                    $fileModel->word_count = $wordCount;
                    $fileModel->save();
                    $article->file_id = $fileModel->id;
                }
            }

            // Replace or create audio
            if ($request->hasFile('audio')) {
                $audio = $request->file('audio');
                if ($article->audio) {
                    // Delete old physical audio from storage
                    if (Storage::disk('public')->exists($article->audio->file_path)) {
                        Storage::disk('public')->delete($article->audio->file_path);
                    }
                    // Update existing audio row
                    $storedPath = $audio->store('uploads/audios', 'public');
                    $article->audio->update([
                        'title' => $audio->getClientOriginalName(),
                        'file_path' => $storedPath,
                        'file_size' => $audio->getSize(),
                        'duration' => 0,
                    ]);
                } else {
                    // Create new audio row and link
                    $audioModel = new Audio();
                    $audioModel->title = $audio->getClientOriginalName();
                    $storedPath = $audio->store('uploads/audios', 'public');
                    $audioModel->file_path = $storedPath;
                    $audioModel->file_size = $audio->getSize();
                    $audioModel->duration = 0;
                    $audioModel->save();
                    $article->audios_id = $audioModel->id;
                }
            }

            $article->save();
            return redirect()->route('articles.index')->with('message', 'Article updated successfully.');
        } catch (\Exception $e) {
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
        return response()->json($articles);
    }

    /**
     * Get audio details for an article.
     */
    public function getAudio($id)
    {
        $audio = Audio::findOrFail($id);
        return response()->json([
            'data' => [
                'id' => $audio->id,
                'title' => $audio->title,
                'file_path' => $audio->file_path,
                'duration' => $audio->duration
            ]
        ]);
    }
}

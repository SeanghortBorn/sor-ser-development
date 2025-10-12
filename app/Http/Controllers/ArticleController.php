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
    public function index(Request $request): Response
    {
        $rsDatas = Article::with(['file', 'audio'])
            ->latest()
            ->paginate(10)
            ->appends(request()->query());

        return Inertia::render('Articles/Index', [
            'articles' => $rsDatas
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
            'file' => 'required|file|max:10240|mimes:txt,pdf,doc,docx', // max 10MB, allowed types
            'audio' => 'required|file|max:20480|mimes:mp3,wav,m4a,ogg', // max 20MB, allowed types
        ]);
        $validated['user_id'] = Auth::user()->id;

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            if ($file->getSize() === 0) {
                return back()->withErrors(['file' => 'Uploaded file is empty.']);
            }
            try {
                $fileModel = new File();
                $fileModel->title = $file->getClientOriginalName();
                $storedPath = $file->store('uploads/files', 'public');
                $fileModel->file_path = Storage::url($storedPath);
                $fileModel->file_size = $file->getSize();
                $fileModel->file_type = $file->getClientMimeType();

                // Count Khmer words if text file
                $wordCount = 0;
                if ($fileModel->file_type === 'text/plain') {
                    $fileContent = file_get_contents($file->getRealPath());
                    $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                    $khmerWordCount = 0;
                    foreach ($tokens as $token) {
                        if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                            $khmerWordCount++;
                        }
                    }
                    $wordCount = $khmerWordCount;
                }
                $fileModel->word_count = $wordCount;
                $fileModel->save();
                $validated['file_id'] = $fileModel->id;
            } catch (\Exception $e) {
                return back()->withErrors(['file' => 'File upload failed: ' . $e->getMessage()]);
            }
        } else {
            return back()->withErrors(['file' => 'No file uploaded.']);
        }

        // Handle audio upload
        if ($request->hasFile('audio')) {
            $audio = $request->file('audio');
            if ($audio->getSize() === 0) {
                return back()->withErrors(['audio' => 'Uploaded audio is empty.']);
            }
            try {
                $audioModel = new Audio();
                $audioModel->title = $audio->getClientOriginalName();
                $storedPath = $audio->store('uploads/audios', 'public');
                $audioModel->file_path = Storage::url($storedPath);
                $audioModel->file_size = $audio->getSize();
                $audioModel->duration = 0;
                $audioModel->save();
                $validated['audios_id'] = $audioModel->id;
            } catch (\Exception $e) {
                return back()->withErrors(['audio' => 'Audio upload failed: ' . $e->getMessage()]);
            }
        } else {
            return back()->withErrors(['audio' => 'No audio uploaded.']);
        }

        $model->create($validated);

        return redirect()->route('articles.index');
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
            'file' => 'nullable|file',
            'audio' => 'nullable|file',
        ]);

        $article->title = $validated['title'];

        $toStoragePath = function (?string $url) {
            if (!$url) return null;
            return str_starts_with($url, '/storage/')
                ? str_replace('/storage/', 'public/', $url)
                : $url;
        };

        // Replace or create file
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            if ($article->file) {
                // Delete old physical file
                Storage::delete($toStoragePath($article->file->file_path));
                // Update existing file row
                $storedPath = $file->store('uploads/files', 'public');
                $fileType = $file->getClientMimeType();
                $wordCount = 0;
                if ($fileType === 'text/plain') {
                    $fileContent = file_get_contents($file->getRealPath());
                    $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                    $khmerWordCount = 0;
                    foreach ($tokens as $token) {
                        if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                            $khmerWordCount++;
                        }
                    }
                    $wordCount = $khmerWordCount;
                }
                $article->file->update([
                    'title' => $file->getClientOriginalName(),
                    'file_path' => Storage::url($storedPath),
                    'file_size' => $file->getSize(),
                    'file_type' => $fileType,
                    'word_count' => $wordCount,
                ]);
            } else {
                // Create new file row and link
                $fileModel = new File();
                $fileModel->title = $file->getClientOriginalName();
                $storedPath = $file->store('uploads/files', 'public');
                $fileModel->file_path = Storage::url($storedPath);
                $fileModel->file_size = $file->getSize();
                $fileModel->file_type = $file->getClientMimeType();
                $wordCount = 0;
                if ($fileModel->file_type === 'text/plain') {
                    $fileContent = file_get_contents($file->getRealPath());
                    $tokens = preg_split('/\s+/u', $fileContent, -1, PREG_SPLIT_NO_EMPTY);
                    $khmerWordCount = 0;
                    foreach ($tokens as $token) {
                        if (preg_match('/[\x{1780}-\x{17FF}]/u', $token)) {
                            $khmerWordCount++;
                        }
                    }
                    $wordCount = $khmerWordCount;
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
                // Delete old physical audio
                Storage::delete($toStoragePath($article->audio->file_path));
                // Update existing audio row
                $storedPath = $audio->store('uploads/audios', 'public');
                $article->audio->update([
                    'title' => $audio->getClientOriginalName(),
                    'file_path' => Storage::url($storedPath),
                    'file_size' => $audio->getSize(),
                    'duration' => 0,
                ]);
            } else {
                // Create new audio row and link
                $audioModel = new Audio();
                $audioModel->title = $audio->getClientOriginalName();
                $storedPath = $audio->store('uploads/audios', 'public');
                $audioModel->file_path = Storage::url($storedPath);
                $audioModel->file_size = $audio->getSize();
                $audioModel->duration = 0;
                $audioModel->save();
                $article->audios_id = $audioModel->id;
            }
        }

        $article->save();

        return redirect()->route('articles.index')->with('message', 'Updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article, $id)
    {
        $rsDatasModel = Article::find($id);
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }
}

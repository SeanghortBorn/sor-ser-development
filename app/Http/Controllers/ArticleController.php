<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

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
            'file' => 'nullable|file',
            'audio' => 'nullable|file',
        ]);
        $validated['user_id'] = auth()->id();

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileModel = new \App\Models\File();
            $fileModel->title = $file->getClientOriginalName();
            $storedPath = $file->store('uploads/files', 'public');
            $fileModel->file_path = Storage::url($storedPath);
            $fileModel->file_size = $file->getSize();
            $fileModel->file_type = $file->getClientMimeType();
            $fileModel->word_count = 0;
            $fileModel->save();
            $validated['file_id'] = $fileModel->id;
        }

        // Handle audio upload
        if ($request->hasFile('audio')) {
            $audio = $request->file('audio');
            $audioModel = new \App\Models\Audio();
            $audioModel->title = $audio->getClientOriginalName();
            $storedPath = $audio->store('uploads/audios', 'public');
            $audioModel->file_path = Storage::url($storedPath);
            $audioModel->file_size = $audio->getSize();
            $audioModel->duration = 0;
            $audioModel->save();
            $validated['audios_id'] = $audioModel->id;
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

        // Update title
        $article->title = $validated['title'];

        // Helper to map public URL to storage path for deletion
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
                $article->file->update([
                    'title' => $file->getClientOriginalName(),
                    'file_path' => Storage::url($storedPath),
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getClientMimeType(),
                ]);
            } else {
                // Create new file row and link
                $fileModel = new \App\Models\File();
                $fileModel->title = $file->getClientOriginalName();
                $storedPath = $file->store('uploads/files', 'public');
                $fileModel->file_path = Storage::url($storedPath);
                $fileModel->file_size = $file->getSize();
                $fileModel->file_type = $file->getClientMimeType();
                $fileModel->word_count = 0;
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
                $audioModel = new \App\Models\Audio();
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

<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $rsDatas = Quiz::latest()->paginate(10)->appends(request()->query());

        return Inertia::render('Quizzes/Index', [
            'quizData' => $rsDatas
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Quizzes/CreateEdit', [
            'datas' => ''
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Quiz $model)
    {
        $model->create($request->validate([
            'name' => 'required|max:255|min:2',
            'view_order' => 'required',
        ]));
        return redirect()->route('quizzes.index');
        // return back()->with('message', 'Data added successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Quiz $quiz, $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quiz $quiz, $id)
    {
        $rsDatasModel = Quiz::find($id);
        return Inertia::render('Quizzes/CreateEdit', [
            'datas' => $rsDatasModel
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $model, $id)
    {
        $request->validate([
            'name' => 'required|max:255|min:2',
            'view_order' => 'required',
        ]);
        
        $rsDatasModel = Quiz::find($id);
        $rsDatasModel->update($request->all());

        return redirect()->route('quizzes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz, $id)
    {
        $rsDatasModel = Quiz::find($id);
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }
}

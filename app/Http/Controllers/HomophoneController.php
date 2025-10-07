<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Homophone;

class HomophoneController extends Controller
{
    public function index()
    {
        $homophones = Homophone::all();
        return Inertia::render('HomoPhone/Index', [
            'homophones' => $homophones
        ]);
    }

    public function create()
    {
        return Inertia::render('HomoPhone/CreateEdit');
    }

    public function edit($id)
    {
        $homophone = Homophone::find($id);
        return Inertia::render('HomoPhone/CreateEdit', [
            'homophone' => $homophone
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);
        Homophone::create($data);
        return redirect()->route('homophones.index')->with('success', 'Homophone added');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);
        Homophone::update($id, $data);
        return redirect()->route('homophones.index')->with('success', 'Homophone updated');
    }

    public function destroy($id)
    {
        Homophone::delete($id);
        return redirect()->route('homophones.index')->with('success', 'Homophone deleted');
    }
}

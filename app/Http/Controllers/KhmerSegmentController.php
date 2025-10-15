<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class KhmerSegmentController extends Controller
{
    public function segment(Request $request)
    {
        $text = $request->input('text', '');
        $response = Http::post(env('KHMER_SEGMENT_API_URL') . '/segment', [
            'text' => $text,
        ]);
        return response()->json($response->json());
    }
}

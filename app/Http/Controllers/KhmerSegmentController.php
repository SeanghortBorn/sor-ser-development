<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class KhmerSegmentController extends Controller
{
    public function segment(Request $request)
    {
        $text = $request->input('text', '');
        $response = Http::post('https://ad9bae85-2730-4d17-884a-59f7d0c1c65a-00-2g5ttjxd1n3o1.picard.replit.dev/segment', [
            'text' => $text,
        ]);
        return response()->json($response->json());
    }
}

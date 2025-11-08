<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KhmerSegmentController extends Controller
{
    public function segment(Request $request)
    {
        $text = (string) $request->input('text', '');

        // Empty text
        if (trim($text) === '') {
            return response()->json(['tokens' => []]);
        }

        $apiBase = env('KHMER_SEGMENT_API_URL');

        // 1. Try external segmenter API
        if (!empty($apiBase)) {
            $endpoint = rtrim($apiBase, '/') . '/segment';

            try {
                $res = Http::timeout(5)->post($endpoint, ['text' => $text]);

                if ($res->successful()) {
                    $json = $res->json();

                    // Normalize payload
                    $tokens = $json['tokens']
                        ?? $json['data']['tokens']
                        ?? $json['data']
                        ?? null;

                    if (is_array($tokens)) {
                        return response()->json([
                            'tokens' => array_values($tokens)
                        ]);
                    }

                    Log::warning('Khmer segmenter returned unexpected payload', [
                        'endpoint' => $endpoint,
                        'status' => $res->status(),
                        'body' => $res->body(),
                    ]);
                } else {
                    Log::warning('Khmer segmenter responded with non-success', [
                        'endpoint' => $endpoint,
                        'status'  => $res->status(),
                        'body'    => $res->body(),
                    ]);
                }

            } catch (\Throwable $e) {
                Log::error("Khmer segment external API error: {$e->getMessage()}", [
                    'endpoint' => $endpoint,
                    'exception' => $e,
                ]);
                // Continue to fallback segmentation
            }
        }

        // 2. Fallback Khmer word segmentation
        // This avoids splitting characters and returns proper word-like chunks.
        preg_match_all('/[\x{1780}-\x{17FF}\x{200B}]+/u', $text, $matches);
        $tokens = array_values($matches[0]);

        return response()->json(['tokens' => $tokens]);
    }
}

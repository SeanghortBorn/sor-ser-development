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

        // Early return for empty text
        if (trim($text) === '') {
            return response()->json(['tokens' => []]);
        }

        $apiBase = env('KHMER_SEGMENT_API_URL');

        // Try external segmenter if configured
        if (!empty($apiBase)) {
            $endpoint = rtrim($apiBase, '/') . '/segment';
            try {
                $res = Http::timeout(5)->post($endpoint, ['text' => $text]);

                if ($res->successful()) {
                    $json = $res->json();
                    // Normalize possible payload shapes
                    $tokens = $json['tokens'] 
                        ?? $json['data']['tokens'] ?? $json['data'] ?? null;

                    if (is_array($tokens)) {
                        return response()->json(['tokens' => array_values($tokens)]);
                    }

                    // If unsuccessful shape, log and fall back
                    Log::warning('Khmer segmenter returned unexpected payload', [
                        'endpoint' => $endpoint,
                        'status' => $res->status(),
                        'body' => $res->body(),
                    ]);
                } else {
                    Log::warning('Khmer segmenter responded with non-success', [
                        'endpoint' => $endpoint,
                        'status' => $res->status(),
                        'body' => $res->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Khmer segment external API error: ' . $e->getMessage(), [
                    'endpoint' => $endpoint,
                    'exception' => $e,
                ]);
                // allow fallback below
            }
        } else {
            Log::debug('KHMER_SEGMENT_API_URL not configured, using local fallback tokenizer');
        }

        // Fallback tokenizer (safe, always returns array)
        // If text contains whitespace, split on whitespace (words).
        // Otherwise return characters (useful for Khmer where spaces may be absent).
        $hasWhitespace = (bool) preg_match('/\s+/u', $text);
        if ($hasWhitespace) {
            $parts = preg_split('/\s+/u', trim($text));
            $tokens = array_values(array_filter($parts, fn($p) => $p !== ''));
        } else {
            $tokens = [];
            $len = mb_strlen($text);
            for ($i = 0; $i < $len; $i++) {
                $tokens[] = mb_substr($text, $i, 1);
            }
        }

        return response()->json(['tokens' => $tokens]);
    }
}

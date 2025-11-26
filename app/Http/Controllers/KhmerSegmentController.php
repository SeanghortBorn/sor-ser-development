<?php
// File: app/Http/Controllers/KhmerSegmentController.php

namespace App\Http\Controllers;

use App\Services\KhmerTokenizerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KhmerSegmentController extends Controller
{
    protected $tokenizer;

    public function __construct(KhmerTokenizerService $tokenizer)
    {
        $this->tokenizer = $tokenizer;
    }

    public function segment(Request $request)
    {
        $text = (string) $request->input('text', '');

        // Empty text
        if (trim($text) === '') {
            return response()->json(['tokens' => []]);
        }

        // PRIMARY: Try local PHP tokenizer first
        try {
            $result = $this->tokenizer->segment($text);
            
            Log::debug('Tokenization successful', [
                'method' => 'local-php',
                'text_length' => mb_strlen($text),
                'token_count' => count($result['tokens']),
            ]);
            
            return response()->json($result);
            
        } catch (\Throwable $e) {
            Log::error("Local tokenizer failed: {$e->getMessage()}", [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
        }

        // FALLBACK: Try external API (keep temporarily during transition)
        $apiBase = env('KHMER_SEGMENT_API_URL');
        
        if (!empty($apiBase)) {
            $endpoint = rtrim($apiBase, '/') . '/segment';

            try {
                $res = Http::timeout(5)->post($endpoint, ['text' => $text]);

                if ($res->successful()) {
                    $json = $res->json();
                    $tokens = $json['tokens'] 
                            ?? $json['data']['tokens'] 
                            ?? $json['data'] 
                            ?? null;

                    if (is_array($tokens)) {
                        Log::debug('External API fallback used', [
                            'endpoint' => $endpoint,
                            'token_count' => count($tokens),
                        ]);
                        
                        return response()->json([
                            'tokens' => array_values($tokens),
                            'source' => 'external-api-fallback'
                        ]);
                    }
                    
                    Log::warning('External API returned unexpected format', [
                        'endpoint' => $endpoint,
                        'response' => $res->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error("External API failed: {$e->getMessage()}", [
                    'endpoint' => $endpoint,
                    'exception' => get_class($e),
                ]);
            }
        }

        // LAST RESORT: Simple character-based segmentation
        Log::warning('Using character fallback segmentation', [
            'text_length' => mb_strlen($text),
        ]);
        
        preg_match_all('/[\x{1780}-\x{17FF}\x{200B}]+/u', $text, $matches);
        $tokens = array_values($matches[0]);

        return response()->json([
            'tokens' => $tokens,
            'source' => 'character-fallback'
        ]);
    }
}

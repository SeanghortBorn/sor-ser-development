<?php 

namespace App\Http\Controllers;

use App\Services\KhmerTokenizerService;
use Illuminate\Http\Request;
use App\Models\Article;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class KhmerCompareController extends Controller
{
    protected $tokenizer;

    public function __construct(KhmerTokenizerService $tokenizer)
    {
        $this->tokenizer = $tokenizer;
    }

    public function compare(Request $request)
    {
        $articleId = $request->input('article_id');
        $userInput = (string) $request->input('userInput', '');

        try {
            $articleText = '';

            // Load article text
            if ($articleId) {
                try {
                    $article = Article::with('file')->find($articleId);

                    if ($article && $article->file) {
                        $filePath = (string) $article->file->file_path;
                        $parsedPath = parse_url($filePath, PHP_URL_PATH) ?? $filePath;
                        $storagePath = str_replace('/storage/', 'public/', $parsedPath);

                        if ($storagePath && Storage::exists($storagePath)) {
                            $articleText = Storage::get($storagePath);
                        } else {
                            $alt1 = "public/uploads/files/" . basename($filePath);
                            $alt2 = "uploads/files/" . basename($filePath);

                            if (Storage::exists($alt1)) {
                                $articleText = Storage::get($alt1);
                            } elseif (Storage::exists($alt2)) {
                                $articleText = Storage::get($alt2);
                            } elseif (!empty($article->text)) {
                                $articleText = $article->text;
                            } else {
                                Log::warning("Article file not found", ['article_id' => $articleId]);
                            }
                        }
                    } elseif ($article && !empty($article->text)) {
                        $articleText = $article->text;
                    }
                } catch (\Exception $e) {
                    Log::error("Load article failed: " . $e->getMessage());
                }
            }

            // Always ensure string
            if (!is_string($articleText)) {
                $articleText = '';
            }

            // Here is the important part
            $userWords = $this->segmentText($userInput, true);     // keep space
            $articleWords = $this->segmentText($articleText, false); // remove space from article

            $m = count($userWords);
            $n = count($articleWords);

            $result = [];
            $indexCompared = 0;
            $i = 0;
            $j = 0;

            $maxLookahead = 5;

            while ($i < $m || $j < $n) {

                $userWord = $userWords[$i] ?? null;
                $articleWord = $articleWords[$j] ?? null;
                $nextUser = $userWords[$i + 1] ?? null;
                $nextArticle = $articleWords[$j + 1] ?? null;

                // Detect space from user input
                if ($userWord === ' ') {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'space',
                        'user_word' => ['user_word' => ' ', 'user_index' => $i],
                        'article_word' => ['article_word' => '', 'article_index' => null],
                        'actions' => [
                            'accept' => ['result' => ' '],
                            'dismiss' => ['result' => ''],
                        ],
                    ];
                    $i++;
                    continue;
                }

                // Same
                if ($i < $m && $j < $n && $userWord === $articleWord) {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'same',
                        'user_word' => ['user_word' => $userWord, 'user_index' => $i],
                        'article_word' => ['article_word' => $articleWord, 'article_index' => $j],
                        'actions' => [
                            'accept' => ['result' => $articleWord],
                            'dismiss' => ['result' => $userWord],
                        ],
                    ];
                    $i++; 
                    $j++;
                    continue;
                }

                // Missing words in user (article has extra)
                $foundMissing = false;
                if ($i < $m && $j < $n) {
                    for ($k = 1; $k <= $maxLookahead && ($j + $k) < $n; $k++) {
                        if ($userWord === $articleWords[$j + $k]) {
                            for ($t = 0; $t < $k; $t++) {
                                $result[] = [
                                    'index_compared' => $indexCompared++,
                                    'type' => 'missing',
                                    'user_word' => ['user_word' => '', 'user_index' => null],
                                    'article_word' => ['article_word' => $articleWords[$j + $t], 'article_index' => $j + $t],
                                    'actions' => [
                                        'accept' => ['result' => $articleWords[$j + $t]],
                                        'dismiss' => ['result' => ''],
                                    ],
                                ];
                            }
                            $j += $k;
                            $foundMissing = true;
                            break;
                        }
                    }
                }

                if ($foundMissing) continue;

                // Extra words in user
                $foundExtra = false;
                if ($i < $m && $j < $n) {
                    for ($k = 1; $k <= $maxLookahead && ($i + $k) < $m; $k++) {
                        if ($articleWord === $userWords[$i + $k]) {
                            for ($t = 0; $t < $k; $t++) {
                                if ($userWords[$i + $t] === ' ') continue;

                                $result[] = [
                                    'index_compared' => $indexCompared++,
                                    'type' => 'extra',
                                    'user_word' => ['user_word' => $userWords[$i + $t], 'user_index' => $i + $t],
                                    'article_word' => ['article_word' => '', 'article_index' => null],
                                    'actions' => [
                                        'accept' => ['result' => ''],
                                        'dismiss' => ['result' => $userWords[$i + $t]],
                                    ],
                                ];
                            }
                            $i += $k;
                            $foundExtra = true;
                            break;
                        }
                    }
                }

                if ($foundExtra) continue;

                // Missing (single)
                if ($userWord !== null && $nextArticle === $userWord) {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'missing',
                        'user_word' => ['user_word' => '', 'user_index' => null],
                        'article_word' => ['article_word' => $articleWords[$j], 'article_index' => $j],
                        'actions' => [
                            'accept' => ['result' => $articleWords[$j]],
                            'dismiss' => ['result' => ''],
                        ],
                    ];
                    $j++;
                    continue;
                }

                // Extra (single)
                if ($articleWord !== null && $nextUser === $articleWord) {
                    if ($userWord !== ' ') {
                        $result[] = [
                            'index_compared' => $indexCompared++,
                            'type' => 'extra',
                            'user_word' => ['user_word' => $userWords[$i], 'user_index' => $i],
                            'article_word' => ['article_word' => '', 'article_index' => null],
                            'actions' => [
                                'accept' => ['result' => ''],
                                'dismiss' => ['result' => $userWords[$i]],
                            ],
                        ];
                    }
                    $i++;
                    continue;
                }

                // Replace
                if ($i < $m && $j < $n) {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'replaced',
                        'user_word' => ['user_word' => $userWord, 'user_index' => $i],
                        'article_word' => ['article_word' => $articleWord, 'article_index' => $j],
                        'actions' => [
                            'accept' => ['result' => $articleWord],
                            'dismiss' => ['result' => $userWord],
                        ],
                    ];
                    $i++; 
                    $j++;
                    continue;
                }

                // Remaining user extras
                if ($i < $m) {
                    if ($userWords[$i] !== ' ') {
                        $result[] = [
                            'index_compared' => $indexCompared++,
                            'type' => 'extra',
                            'user_word' => ['user_word' => $userWords[$i], 'user_index' => $i],
                            'article_word' => ['article_word' => '', 'article_index' => null],
                            'actions' => [
                                'accept' => ['result' => ''],
                                'dismiss' => ['result' => $userWords[$i]],
                            ],
                        ];
                    }
                    $i++;
                    continue;
                }

                // Remaining article missing
                if ($j < $n) {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'missing',
                        'user_word' => ['user_word' => '', 'user_index' => null],
                        'article_word' => ['article_word' => $articleWords[$j], 'article_index' => $j],
                        'actions' => [
                            'accept' => ['result' => $articleWords[$j]],
                            'dismiss' => ['result' => ''],
                        ],
                    ];
                    $j++;
                    continue;
                }
            }

            return response()->json([
                'user_words' => $userWords,
                'article_words' => $articleWords,
                'comparison' => $result,
                'stats' => [
                    'same' => count(array_filter($result, fn($r) => $r['type'] === 'same')),
                    'missing' => count(array_filter($result, fn($r) => $r['type'] === 'missing')),
                    'extra' => count(array_filter($result, fn($r) => $r['type'] === 'extra')),
                    'replaced' => count(array_filter($result, fn($r) => $r['type'] === 'replaced')),
                    'space' => count(array_filter($result, fn($r) => $r['type'] === 'space')),
                ],
            ]);

        } catch (\Throwable $e) {
            Log::error("Compare failed: " . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Comparison failed',
            ], 500);
        }
    }

    /**
     * 
     * Segment text: keep space for user, remove space in article
     */
    private function segmentText(?string $text, bool $keepSpace = false): array
    {
        $text = (string) ($text ?? '');
        if ($text === '') return [];

        // PRIMARY: Use local PHP tokenizer
        try {
            $tokens = $this->tokenizer->tokenize($text, $keepSpace);
            
            if (!$keepSpace) {
                // Article mode: remove spaces and empty tokens
                $tokens = array_values(array_filter($tokens, fn($t) => trim($t) !== ''));
            }
            
            Log::debug('Segmentation successful', [
                'method' => 'local-tokenizer',
                'keepSpace' => $keepSpace,
                'token_count' => count($tokens),
            ]);
            
            return $tokens;
            
        } catch (\Throwable $e) {
            Log::error("Local tokenization failed: {$e->getMessage()}", [
                'text_length' => mb_strlen($text),
                'keepSpace' => $keepSpace,
            ]);
        }

        // FALLBACK: Try external API (temporary during transition)
        $apiUrl = env('KHMER_SEGMENT_API_URL') 
                    ? rtrim(env('KHMER_SEGMENT_API_URL'), '/') . '/segment'
                    : null;

        if ($apiUrl) {
            try {
                $res = Http::timeout(3)->post($apiUrl, ['text' => $text]);
                
                if ($res->successful()) {
                    $json = $res->json();
                    $tokens = $json['tokens'] ?? ($json['data']['tokens'] ?? []);

                    if (!is_array($tokens)) {
                        $tokens = [];
                    }

                    if ($keepSpace) {
                        return array_map(fn($t) => $t === '' ? ' ' : $t, $tokens);
                    }

                    // Article mode: remove spaces
                    return array_values(array_filter($tokens, fn($t) => trim($t) !== ''));
                }
            } catch (\Throwable $e) {
                Log::debug("External API segmentation failed", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // LAST RESORT: character-by-character fallback
        Log::warning('Using character fallback in comparison', [
            'text_length' => mb_strlen($text),
            'keepSpace' => $keepSpace,
        ]);
        
        $tokens = [];
        $len = mb_strlen($text);

        for ($i = 0; $i < $len; $i++) {
            $char = mb_substr($text, $i, 1);

            if ($char === ' ') {
                if ($keepSpace) {
                    $tokens[] = ' ';
                }
                continue;
            }

            $tokens[] = $char;
        }

        return $tokens;
    }
}

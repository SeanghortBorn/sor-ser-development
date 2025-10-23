<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KhmerCompareController extends Controller
{
    public function compare(Request $request)
    {
        $articleId = $request->input('article_id');
        $userInput = trim($request->input('userInput', ''));

        try {
            $articleText = '';

            // Load article text from database or storage
            if ($articleId) {
                try {
                    $article = Article::with('file')->find($articleId);

                    if ($article && $article->file) {
                        // ensure file_path is a string and safe for parse_url
                        $filePath = is_scalar($article->file->file_path) ? (string)$article->file->file_path : '';
                        $parsedPath = parse_url($filePath, PHP_URL_PATH) ?? $filePath;
                        $storagePath = str_replace('/storage/', 'public/', $parsedPath);

                        if ($storagePath && Storage::exists($storagePath)) {
                            $articleText = Storage::get($storagePath);
                        } else {
                            $alt1 = "public/uploads/files/" . basename($filePath);
                            $alt2 = "uploads/files/" . basename($filePath);

                            if (!empty($alt1) && Storage::exists($alt1)) {
                                $articleText = Storage::get($alt1);
                            } elseif (!empty($alt2) && Storage::exists($alt2)) {
                                $articleText = Storage::get($alt2);
                            } else {
                                // fallback to article->text field if file not found
                                if (!empty($article->text)) {
                                    $articleText = $article->text;
                                } else {
                                    Log::warning("Article file not found and no text field", ['article_id' => $articleId]);
                                }
                            }
                        }
                    } elseif ($article && !empty($article->text)) {
                        // fallback if no file but text exists
                        $articleText = $article->text;
                    } else {
                        Log::warning("Article or file not found", ['article_id' => $articleId]);
                    }
                } catch (\Exception $e) {
                    Log::error("Error loading article file", [
                        'article_id' => $articleId,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Ensure $articleText is a string
            if (!is_string($articleText)) {
                $articleText = '';
            }

            // Split text into words - ensure we always get arrays (avoid preg_split false)
            $userWords = preg_split('/\s+/', $userInput, -1, PREG_SPLIT_NO_EMPTY);
            if ($userWords === false) $userWords = [];
            $articleWords = preg_split('/\s+/', trim($articleText), -1, PREG_SPLIT_NO_EMPTY);
            if ($articleWords === false) $articleWords = [];

            // Quick match if exactly equal
            if (implode(' ', $userWords) === implode(' ', $articleWords)) {
                $comparison = [];
                foreach ($userWords as $index => $word) {
                    $comparison[] = [
                        'index_compared' => $index,
                        'type' => 'same',
                        'user_word' => ['user_word' => $word, 'user_index' => $index],
                        'article_word' => ['article_word' => $word, 'article_index' => $index],
                        'actions' => [
                            'accept' => ['result' => $word],
                            'dismiss' => ['result' => $word],
                        ],
                    ];
                }

                return response()->json([
                    'user_words' => $userWords,
                    'article_words' => $articleWords,
                    'comparison' => $comparison,
                    'stats' => [
                        'same' => count($comparison),
                        'missing' => 0,
                        'extra' => 0,
                        'replaced' => 0,
                    ],
                ]);
            }

            // Word-by-word comparison (defensive accesses only)
            $m = count($userWords);
            $n = count($articleWords);
            $result = [];
            $indexCompared = 0;
            $i = 0;
            $j = 0;

            while ($i < $m || $j < $n) {
                $userWord = $userWords[$i] ?? null;
                $articleWord = $articleWords[$j] ?? null;
                $nextUser = $userWords[$i + 1] ?? null;
                $nextArticle = $articleWords[$j + 1] ?? null;

                // Same words
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
                    $i++; $j++;
                    continue;
                }

                // Missing in user (article has extra at j)
                if ($j < $n && ($userWord ?? null) === $nextArticle) {
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

                // Extra in user (user has an extra word at i)
                if ($i < $m && $nextUser === $articleWord) {
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
                    $i++;
                    continue;
                }

                // Replaced / fallback
                if ($i < $m && $j < $n) {
                    $result[] = [
                        'index_compared' => $indexCompared++,
                        'type' => 'replaced',
                        'user_word' => ['user_word' => $userWords[$i], 'user_index' => $i],
                        'article_word' => ['article_word' => $articleWords[$j], 'article_index' => $j],
                        'actions' => [
                            'accept' => ['result' => $articleWords[$j]],
                            'dismiss' => ['result' => $userWords[$i]],
                        ],
                    ];
                    $i++; $j++;
                } elseif ($i < $m) {
                    // remaining user extras
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
                    $i++;
                } elseif ($j < $n) {
                    // remaining article missings
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
                }
            }

            // Return structured JSON response
            return response()->json([
                'user_words' => $userWords,
                'article_words' => $articleWords,
                'comparison' => $result,
                'stats' => [
                    'same' => count(array_filter($result, fn($r) => $r['type'] === 'same')),
                    'missing' => count(array_filter($result, fn($r) => $r['type'] === 'missing')),
                    'extra' => count(array_filter($result, fn($r) => $r['type'] === 'extra')),
                    'replaced' => count(array_filter($result, fn($r) => $r['type'] === 'replaced')),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Compare error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString(), 'request' => $request->all()]);
            return response()->json([
                'error' => true,
                'message' => 'Failed to compare texts on server',
            ], 500);
        }
    }
}

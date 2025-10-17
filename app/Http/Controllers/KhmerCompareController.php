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

        $articleText = '';

        // Load article text from database or storage
        if ($articleId) {
            try {
                $article = Article::with('file')->find($articleId);

                if ($article && $article->file) {
                    $storagePath = str_replace('/storage/', 'public/', parse_url($article->file->file_path, PHP_URL_PATH));

                    if (Storage::exists($storagePath)) {
                        $articleText = Storage::get($storagePath);
                    } else {
                        $alt1 = "public/uploads/files/" . basename($article->file->file_path);
                        $alt2 = "uploads/files/" . basename($article->file->file_path);

                        if (Storage::exists($alt1)) {
                            $articleText = Storage::get($alt1);
                        } elseif (Storage::exists($alt2)) {
                            $articleText = Storage::get($alt2);
                        } else {
                            Log::warning("Article file not found", ['article_id' => $articleId]);
                        }
                    }
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

        // ✂️ Split text into words
        $userWords = preg_split('/\s+/', $userInput, -1, PREG_SPLIT_NO_EMPTY);
        $articleWords = preg_split('/\s+/', trim($articleText), -1, PREG_SPLIT_NO_EMPTY);

        // If exactly the same text (quick match)
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

        // Otherwise, do word-by-word comparison
        $m = count($userWords);
        $n = count($articleWords);
        $result = [];
        $indexCompared = 0;
        $i = 0;
        $j = 0;

        while ($i < $m || $j < $n) {
            // Same words
            if ($i < $m && $j < $n && $userWords[$i] === $articleWords[$j]) {
                $result[] = [
                    'index_compared' => $indexCompared++,
                    'type' => 'same',
                    'user_word' => ['user_word' => $userWords[$i], 'user_index' => $i],
                    'article_word' => ['article_word' => $articleWords[$j], 'article_index' => $j],
                    'actions' => [
                        'accept' => ['result' => $articleWords[$j]],
                        'dismiss' => ['result' => $userWords[$i]],
                    ],
                ];
                $i++;
                $j++;
                continue;
            }

            $nextUser = $userWords[$i + 1] ?? null;
            $nextArticle = $articleWords[$j + 1] ?? null;

            // Missing in user
            if ($j < $n && ($userWords[$i] ?? null) === $nextArticle) {
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

            // Extra in user
            if ($i < $m && $nextUser === $articleWords[$j]) {
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

            // Replaced words
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
                $i++;
                $j++;
            } elseif ($i < $m) {
                // Remaining user extras
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
                // Remaining article missings
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
    }
}

<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class KhmerTokenizerService
{
    /**
     * Common Khmer words dictionary for fallback segmentation
     */
    private static $khmerWords = [
        // Countries and places
        'ប្រទេស', 'កម្ពុជា', 'ភ្នំពេញ', 'សៀមរាប',
        
        // Culture and tradition
        'វប្បធម៌', 'ប្រពៃណី', 'សង្គម', 'ប្រជាជន',
        
        // Common nouns
        'មនុស្ស', 'អ្នក', 'គេ', 'ពួកគេ', 'មិត្ត', 'ក្រុមគ្រួសារ',
        'រូបភាព', 'អត្ថបទ', 'ព័ត៌មាន', 'ព្រឹត្តិការណ៍',
        
        // Pronouns
        'យើង', 'គាត់', 'ខ្ញុំ', 'នេះ', 'នោះ',
        'ម្នាក់', 'អ្នកណា', 'អ្វី', 'កន្លែងណា', 'ពេលណា',
        
        // Common verbs
        'មាន', 'ជា', 'ធ្វើ', 'ទៅ', 'មក', 'បាន', 'ឲ្យ',
        'ទទួល', 'ផ្តល់', 'ប្រើប្រាស់', 'ដឹង', 'យល់', 'ស្គាល់',
        'មើល', 'ស្តាប់', 'និយាយ', 'សរសេរ', 'អាន', 'គិត',
        
        // Modals
        'អាច', 'ត្រូវ', 'គួរ', 'ចង់', 'ចាំបាច់',
        'នឹង', 'កំពុង', 'កំពុងតែ', 'ហើយ', 'រួច',
        
        // Adjectives
        'ល្អ', 'អត្រា', 'ច្រើន', 'តិច', 'ធំ', 'តូច',
        'ថ្មី', 'ចាស់', 'សម្បូរបែប', 'សំខាន់', 'ពិសេស',
        
        // Conjunctions
        'និង', 'ឬ', 'ប៉ុន្តែ', 'ដូច្នេះ', 'ព្រោះ', 'ដើម្បី',
        'បើ', 'ប្រសិនបើ', 'ទោះបីជា', 'ទោះ', 'ដោយសារ',
        
        // Prepositions
        'នៅ', 'ក្នុង', 'ពី', 'ដល់', 'ជាមួយ', 'ដោយ',
        'ចំពោះ', 'រវាង', 'លើ', 'ក្រោម', 'មុន', 'ក្រោយ',
        
        // Time words
        'ថ្ងៃ', 'យប់', 'ព្រឹក', 'ល្ងាច', 'ថ្ងៃនេះ', 'ថ្ងៃស្អែក',
        'ឆ្នាំ', 'ខែ', 'សប្តាហ៍', 'នាទី', 'ម៉ោង', 'វេលា',
        
        // Education-related
        'អក្សរ', 'ពាក្យ', 'ប្រយោគ', 'តួអក្សរ', 'សូរស្រដៀង',
        'ការសិក្សា', 'រៀន', 'បង្រៀន', 'សាលារៀន', 'និស្សិត',
        'គ្រូ', 'លំហាត់', 'សំណួរ', 'ចម្លើយ', 'ប្រឡង',
    ];

    /**
     * Tokenize Khmer text into words/tokens
     * PRIMARY: Uses external API, FALLBACK: PHP tokenizer
     */
    public function tokenize(string $text, bool $keepSpaces = false): array
{
    // PRIMARY: Try external API first (khmernltk via Render.com)
    $apiBase = config('services.khmer_segment.url');
    
    if (!empty($apiBase)) {
        $endpoint = rtrim($apiBase, '/') . '/segment';
        
        try {
            $response = Http::timeout(5)->post($endpoint, [
                'text' => $text,
                'keep_spaces' => $keepSpaces
            ]);
            
            if ($response->successful()) {
                $json = $response->json();
                $tokens = $json['tokens'] 
                        ?? $json['data']['tokens'] 
                        ?? $json['data'] 
                        ?? null;
                
                if (is_array($tokens) && count($tokens) > 0) {
                    Log::debug('Tokenization successful', [
                        'method' => 'external-api',
                        'api_url' => $endpoint,
                        'text_length' => mb_strlen($text),
                        'token_count' => count($tokens),
                        'keepSpaces' => $keepSpaces,
                    ]);
                    
                    return array_values($tokens);
                }
            }
            
            Log::warning('External API returned unexpected format', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
        } catch (\Throwable $e) {
            Log::warning("External API failed, falling back to local", [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
                'exception' => get_class($e),
            ]);
        }
    }
    
    // FALLBACK: Use local PHP tokenizer
    Log::info('Using local PHP tokenizer fallback', [
        'text_length' => mb_strlen($text),
        'keepSpaces' => $keepSpaces,
    ]);
    
    return $this->segmentLocally($text, $keepSpaces);
}

    private function hasKhmerCharacters(string $text): bool
    {
        return preg_match('/[\x{1780}-\x{17FF}]/u', $text) === 1;
    }

    private function tokenizeNonKhmer(string $text, bool $keepSpaces): array
    {
        $pattern = '/([A-Za-z]+|\d+|[.,!?;:]|[\s\n\t]+)/u';
        preg_match_all($pattern, $text, $matches);
        $tokens = $matches[0];

        if (!$keepSpaces) {
            $tokens = array_filter($tokens, function($token) {
                return !preg_match('/^\s+$/', $token);
            });
        }

        return array_values($tokens);
    }

    private function tokenizeKhmer(string $text, bool $keepSpaces): array
    {
        $tokens = [];
        $length = mb_strlen($text, 'UTF-8');
        $i = 0;

        while ($i < $length) {
            $char = mb_substr($text, $i, 1, 'UTF-8');

            if (preg_match('/[\s\n\t]/u', $char)) {
                if ($keepSpaces) {
                    $tokens[] = $char;
                }
                $i++;
                continue;
            }

            if (preg_match('/[។៕៚.,!?;:]/u', $char)) {
                $tokens[] = $char;
                $i++;
                continue;
            }

            if (preg_match('/[A-Za-z0-9]/u', $char)) {
                $word = $this->extractAlphanumeric($text, $i);
                $tokens[] = $word;
                $i += mb_strlen($word, 'UTF-8');
                continue;
            }

            if ($this->isKhmerCharacter($char)) {
                $word = $this->extractKhmerWord($text, $i);
                $tokens[] = $word;
                $i += mb_strlen($word, 'UTF-8');
                continue;
            }

            $tokens[] = $char;
            $i++;
        }

        return array_values($tokens);
    }

    private function isKhmerCharacter(string $char): bool
    {
        $code = $this->getUnicodeCodePoint($char);
        return $code >= 0x1780 && $code <= 0x17FF;
    }

    private function getUnicodeCodePoint(string $char): int
    {
        $values = unpack('N', mb_convert_encoding($char, 'UCS-4BE', 'UTF-8'));
        return $values[1] ?? 0;
    }

    private function extractAlphanumeric(string $text, int $i): string
    {
        $word = '';
        $length = mb_strlen($text, 'UTF-8');

        while ($i < $length) {
            $char = mb_substr($text, $i, 1, 'UTF-8');
            if (!preg_match('/[A-Za-z0-9]/u', $char)) {
                break;
            }
            $word .= $char;
            $i++;
        }

        return $word;
    }

    private function extractKhmerWord(string $text, int $start): string
    {
        $length = mb_strlen($text, 'UTF-8');
        $maxMatchLength = min(15, $length - $start);
        
        for ($len = $maxMatchLength; $len >= 2; $len--) {
            $substr = mb_substr($text, $start, $len, 'UTF-8');
            
            if (in_array($substr, self::$khmerWords, true)) {
                return $substr;
            }
        }

        $word = '';
        $i = $start;

        while ($i < $length) {
            $char = mb_substr($text, $i, 1, 'UTF-8');
            
            if (!$this->isKhmerCharacter($char)) {
                break;
            }

            $word .= $char;
            $i++;

            if ($this->isWordBoundary($text, $i)) {
                break;
            }
        }

        return $word ?: mb_substr($text, $start, 1, 'UTF-8');
    }

    private function isWordBoundary(string $text, int $pos): bool
    {
        $length = mb_strlen($text, 'UTF-8');
        
        if ($pos >= $length) {
            return true;
        }

        $char = mb_substr($text, $pos, 1, 'UTF-8');
        
        if (preg_match('/[\s។៕៚.,!?;:]/u', $char)) {
            return true;
        }

        if (!$this->isKhmerCharacter($char)) {
            return true;
        }

        return false;
    }

    public function segment(string $text): array
    {
        $tokens = $this->tokenize($text, true);
        
        return [
            'tokens' => $tokens,
            'source' => 'khmer-tokenizer-service',
        ];
    }

    public static function addWords(array $words): void
    {
        self::$khmerWords = array_unique(array_merge(self::$khmerWords, $words));
    }
}
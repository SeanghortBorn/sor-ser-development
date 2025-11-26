<?php
// File: app/Services/KhmerTokenizerService.php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class KhmerTokenizerService
{
    /**
     * Common Khmer words dictionary for better segmentation
     * Expand this list based on your article content
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
        'យើង', 'គាត់', 'ខ្ញុំ', 'នេះ', 'នោះ', 'នេះ', 'នោះ',
        'ម្នាក់', 'អ្នកណា', 'អ្វី', 'កន្លែងណា', 'ពេលណា',
        
        // Common verbs
        'មាន', 'ជា', 'ធ្វើ', 'ទៅ', 'មក', 'បាន', 'ឲ្យ',
        'ទទួល', 'ផ្តល់', 'ប្រើប្រាស់', 'ដឹង', 'យល់', 'ស្គាល់',
        'មើល', 'ស្តាប់', 'និយាយ', 'សរសេរ', 'អាន', 'គិត',
        
        // Modals and auxiliaries
        'អាច', 'ត្រូវ', 'គួរ', 'ចង់', 'ចាំបាច់', 'ចាស់',
        'នឹង', 'បាន', 'កំពុង', 'កំពុងតែ', 'ហើយ', 'រួច',
        
        // Adjectives
        'ល្អ', 'អត្រា', 'ច្រើន', 'តិច', 'ធំ', 'តូច',
        'ថ្មី', 'ចាស់', 'សម្បូរបែប', 'សំខាន់', 'ពិសេស',
        
        // Conjunctions and connectors
        'និង', 'ឬ', 'ប៉ុន្តែ', 'ដូច្នេះ', 'ព្រោះ', 'ដើម្បី',
        'បើ', 'ប្រសិនបើ', 'ទោះបីជា', 'ទោះ', 'ដោយសារ',
        
        // Prepositions
        'នៅ', 'ក្នុង', 'ពី', 'ដល់', 'ជាមួយ', 'ដោយ',
        'ចំពោះ', 'រវាង', 'លើ', 'ក្រោម', 'មុន', 'ក្រោយ',
        
        // Numbers and quantifiers
        'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ',
        'ទាំងអស់', 'គ្រប់', 'ខ្លះ', 'ផ្សេងទៀត',
        
        // Time words
        'ថ្ងៃ', 'យប់', 'ព្រឹក', 'ល្ងាច', 'ថ្ងៃនេះ', 'ថ្ងៃស្អែក',
        'ឆ្នាំ', 'ខែ', 'សប្តាហ៍', 'នាទី', 'ម៉ោង', 'វេលា',
        
        // Education-related (for your app)
        'អក្សរ', 'ពាក្យ', 'ប្រយោគ', 'តួអក្សរ', 'សូរស្រដៀង',
        'ការសិក្សា', 'រៀន', 'បង្រៀន', 'សាលារៀន', 'និស្សិត',
        'គ្រូ', 'លំហាត់', 'សំណួរ', 'ចម្លើយ', 'ប្រឡង',
        
        // Technology
        'កម្មវិធី', 'គេហទំព័រ', 'អ៊ីនធឺណិត', 'កុំព្យូទ័រ',
        
        // Common phrases
        'ជាប់ទាក់ទង', 'មានន័យថា', 'គួរតែ', 'អាចនឹង',
        'ដែលជា', 'ដែលបាន', 'ដែលកំពុង', 'ដែលនឹង',
    ];

    /**
     * Tokenize Khmer text into words/tokens
     * 
     * @param string $text Input text to tokenize
     * @param bool $keepSpaces Whether to preserve space tokens
     * @return array Array of tokens
     */
    public function tokenize(string $text, bool $keepSpaces = true): array
    {
        if (empty(trim($text))) {
            return [];
        }

        // Check if text contains Khmer characters
        if (!$this->hasKhmerCharacters($text)) {
            return $this->tokenizeNonKhmer($text, $keepSpaces);
        }

        // Tokenize Khmer text
        return $this->tokenizeKhmer($text, $keepSpaces);
    }

    /**
     * Check if text contains Khmer Unicode characters
     */
    private function hasKhmerCharacters(string $text): bool
    {
        return preg_match('/[\x{1780}-\x{17FF}]/u', $text) === 1;
    }

    /**
     * Tokenize non-Khmer text (English, numbers, punctuation)
     */
    private function tokenizeNonKhmer(string $text, bool $keepSpaces): array
    {
        // Pattern: words, numbers, punctuation, spaces
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

    /**
     * Tokenize Khmer text using dictionary and fallback methods
     */
    private function tokenizeKhmer(string $text, bool $keepSpaces): array
    {
        $tokens = [];
        $length = mb_strlen($text, 'UTF-8');
        $i = 0;

        while ($i < $length) {
            $char = mb_substr($text, $i, 1, 'UTF-8');

            // Handle whitespace
            if (preg_match('/[\s\n\t]/u', $char)) {
                if ($keepSpaces) {
                    $tokens[] = $char;
                }
                $i++;
                continue;
            }

            // Handle punctuation
            if (preg_match('/[។៕៚.,!?;:]/u', $char)) {
                $tokens[] = $char;
                $i++;
                continue;
            }

            // Handle English/numbers mixed in
            if (preg_match('/[A-Za-z0-9]/u', $char)) {
                $word = $this->extractAlphanumeric($text, $i);
                $tokens[] = $word;
                $i += mb_strlen($word, 'UTF-8');
                continue;
            }

            // Handle Khmer characters
            if ($this->isKhmerCharacter($char)) {
                $word = $this->extractKhmerWord($text, $i);
                $tokens[] = $word;
                $i += mb_strlen($word, 'UTF-8');
                continue;
            }

            // Unknown character - add as single token
            $tokens[] = $char;
            $i++;
        }

        return array_values($tokens);
    }

    /**
     * Check if character is in Khmer Unicode range
     */
    private function isKhmerCharacter(string $char): bool
    {
        $code = $this->getUnicodeCodePoint($char);
        return $code >= 0x1780 && $code <= 0x17FF;
    }

    /**
     * Get Unicode code point for a character
     */
    private function getUnicodeCodePoint(string $char): int
    {
        $values = unpack('N', mb_convert_encoding($char, 'UCS-4BE', 'UTF-8'));
        return $values[1] ?? 0;
    }

    /**
     * Extract alphanumeric word starting at position $i
     */
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

    /**
     * Extract Khmer word using dictionary matching and character analysis
     */
    private function extractKhmerWord(string $text, int $start): string
    {
        $length = mb_strlen($text, 'UTF-8');
        
        // Try dictionary matching first (longest match)
        $maxMatchLength = min(15, $length - $start);
        
        for ($len = $maxMatchLength; $len >= 2; $len--) {
            $substr = mb_substr($text, $start, $len, 'UTF-8');
            
            if (in_array($substr, self::$khmerWords, true)) {
                return $substr;
            }
        }

        // Fallback: extract continuous Khmer characters until boundary
        $word = '';
        $i = $start;

        while ($i < $length) {
            $char = mb_substr($text, $i, 1, 'UTF-8');
            
            if (!$this->isKhmerCharacter($char)) {
                break;
            }

            $word .= $char;
            $i++;

            // Stop at word boundaries
            if ($this->isWordBoundary($text, $i)) {
                break;
            }
        }

        return $word ?: mb_substr($text, $start, 1, 'UTF-8');
    }

    /**
     * Detect potential word boundary (heuristic-based)
     */
    private function isWordBoundary(string $text, int $pos): bool
    {
        $length = mb_strlen($text, 'UTF-8');
        
        if ($pos >= $length) {
            return true;
        }

        $char = mb_substr($text, $pos, 1, 'UTF-8');
        
        // If next char is punctuation or space, it's a boundary
        if (preg_match('/[\s។៕៚.,!?;:]/u', $char)) {
            return true;
        }

        // Check if next character is a non-Khmer character
        if (!$this->isKhmerCharacter($char)) {
            return true;
        }

        return false;
    }

    /**
     * Segment text wrapper - maintains compatibility with existing API
     * 
     * @param string $text
     * @return array ['tokens' => [...], 'source' => 'php-tokenizer']
     */
    public function segment(string $text): array
    {
        $tokens = $this->tokenize($text, true);
        
        return [
            'tokens' => $tokens,
            'source' => 'php-tokenizer',
        ];
    }

    /**
     * Add custom words to dictionary (for runtime expansion)
     * 
     * @param array $words
     */
    public static function addWords(array $words): void
    {
        self::$khmerWords = array_unique(array_merge(self::$khmerWords, $words));
    }
}

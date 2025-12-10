<?php

namespace App\Services;

class KhmerTextService
{
    /**
     * Count Khmer words in a file
     *
     * @param string $filePath Physical file path
     * @param string|null $mimeType File MIME type (if null, will try to detect)
     * @return int Number of Khmer words
     */
    public function countKhmerWordsFromFile(string $filePath, ?string $mimeType = null): int
    {
        // Only count for text/plain files
        if ($mimeType && $mimeType !== 'text/plain') {
            return 0;
        }

        if (!file_exists($filePath)) {
            return 0;
        }

        $fileContent = file_get_contents($filePath);
        return $this->countKhmerWordsFromText($fileContent);
    }

    /**
     * Count Khmer words in a text string
     *
     * @param string $text The text content
     * @return int Number of Khmer words
     */
    public function countKhmerWordsFromText(string $text): int
    {
        if (empty($text)) {
            return 0;
        }

        $wordCount = 0;
        $tokens = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);

        foreach ($tokens as $token) {
            if ($this->isKhmerText($token)) {
                $wordCount++;
            }
        }

        return $wordCount;
    }

    /**
     * Check if text contains Khmer characters
     *
     * @param string $text The text to check
     * @return bool True if contains Khmer characters
     */
    public function isKhmerText(string $text): bool
    {
        // Khmer Unicode range: U+1780 to U+17FF
        return preg_match('/[\x{1780}-\x{17FF}]/u', $text) === 1;
    }

    /**
     * Extract only Khmer text from mixed content
     *
     * @param string $text Mixed text content
     * @return string Only Khmer characters and whitespace
     */
    public function extractKhmerText(string $text): string
    {
        // Keep Khmer characters and whitespace, remove everything else
        return preg_replace('/[^\x{1780}-\x{17FF}\s]/u', '', $text);
    }
}

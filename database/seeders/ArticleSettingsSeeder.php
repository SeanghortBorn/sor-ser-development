<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\ArticleSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ArticleSettingsSeeder extends Seeder
{
    /**
     * DYNAMIC Article Settings Seeder
     * 
     * This seeder works with ANY article names - no specific patterns required!
     * 
     * What it does:
     * 1. Gets ALL existing articles from your database
     * 2. Creates default settings for each article
     * 3. Sets them in order (by ID)
     * 4. First article = "always" available, rest = "sequential"
     * 
     * After running this seeder:
     * - Go to /article-settings in your browser
     * - Drag-drop to reorder articles
     * - Click each article to set prerequisites, delays, typing modes
     * 
     * You can run this seeder multiple times - it will NOT duplicate entries
     */
    public function run(): void
    {
        // Safety check: make sure the table exists
        if (!Schema::hasTable('article_settings')) {
            $this->command->error('❌ Table "article_settings" does not exist!');
            $this->command->info('Please run: php artisan migrate');
            return;
        }

        // Get all articles ordered by ID
        $articles = Article::orderBy('id')->get();

        if ($articles->isEmpty()) {
            $this->command->warn('⚠️ No articles found in database.');
            $this->command->info('Please create some articles first, then run this seeder again.');
            return;
        }

        $this->command->info('🚀 Setting up article progression for ' . $articles->count() . ' articles...');
        $this->command->newLine();

        DB::transaction(function () use ($articles) {
            $previousArticleId = null;

            foreach ($articles as $index => $article) {
                $displayOrder = $index + 1;
                $isFirstArticle = ($index === 0);

                // Create or update settings for this article
                $setting = ArticleSetting::updateOrCreate(
                    ['article_id' => $article->id],
                    [
                        'display_order' => $displayOrder,
                        // First article is always available, rest require the previous article
                        'prerequisite_article_id' => $isFirstArticle ? null : $previousArticleId,
                        'availability_mode' => $isFirstArticle ? 'always' : 'sequential',
                        'unlock_delay_days' => 0,
                        'unlock_delay_hours' => 0,
                        'typing_mode' => 'nlp_only', // Default to basic mode
                        'slug' => $this->generateSlug($article->title, $displayOrder),
                        'category' => $this->guessCategory($article->title),
                        'description' => null,
                        'is_active' => true,
                        'is_required' => true,
                        'max_attempts' => null,
                        'min_completion_accuracy' => null,
                    ]
                );

                // Show progress
                $modeIcon = $isFirstArticle ? '🟢' : '🔵';
                $modeText = $isFirstArticle ? 'Always' : 'Sequential';
                $prereqText = $isFirstArticle ? '-' : "requires #{$previousArticleId}";
                
                $this->command->info(
                    sprintf(
                        "  %s [%d] %s - %s (%s)",
                        $modeIcon,
                        $displayOrder,
                        str_pad($article->title, 30),
                        $modeText,
                        $prereqText
                    )
                );

                // Remember this article for next iteration
                $previousArticleId = $article->id;
            }
        });

        $this->command->newLine();
        $this->command->info('✅ Article progression setup complete!');
        $this->command->newLine();
        $this->command->info('📋 Summary:');
        $this->command->info('   - Total articles configured: ' . $articles->count());
        $this->command->info('   - First article: Always available');
        $this->command->info('   - Other articles: Sequential (requires completing previous)');
        $this->command->info('   - All articles: NLP Only mode (basic features)');
        $this->command->newLine();
        $this->command->info('🔧 Next steps:');
        $this->command->info('   1. Go to /article-settings in your browser');
        $this->command->info('   2. Drag-drop to reorder articles if needed');
        $this->command->info('   3. Click each article to configure:');
        $this->command->info('      - Prerequisites (which article must be completed first)');
        $this->command->info('      - Time delays (e.g., 10 days after completing previous)');
        $this->command->info('      - Typing mode (NLP Only vs NLP+LA)');
        $this->command->newLine();

        $articles = Article::orderBy('id')->get();
        
        if ($articles->isEmpty()) {
            $this->command->info('No articles found. Please create articles first.');
            return;
        }

        $previousArticleId = null;
        $order = 1;

        foreach ($articles as $article) {
            ArticleSetting::updateOrCreate(
                ['article_id' => $article->id],
                [
                    'display_order' => $order,
                    'prerequisite_article_id' => $previousArticleId,
                    'unlock_delay_days' => 0,
                    'unlock_delay_hours' => 0,
                    'availability_mode' => $previousArticleId === null ? 'always' : 'sequential',
                    'typing_mode' => 'none', // Adaptive mode
                    'slug' => \Illuminate\Support\Str::slug($article->title),
                    'category' => 'general',
                    'description' => null,
                    'is_active' => true,
                    'is_required' => true,
                    'max_attempts' => null,
                    'min_completion_accuracy' => 70.0,
                ]
            );

            $previousArticleId = $article->id;
            $order++;
        }

        $this->command->info("✅ Created settings for {$articles->count()} articles");
        $this->command->info("📌 First article: Always available");
        $this->command->info("📌 Other articles: Sequential (must complete previous)");
        $this->command->info("📌 Typing mode: Adaptive (based on user role)");
    }

    /**
     * Generate a URL-friendly slug from title
     */
    private function generateSlug(string $title, int $order): string
    {
        // Convert to lowercase, replace spaces with hyphens
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9\-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // If slug is empty, use order number
        if (empty($slug)) {
            return 'article-' . $order;
        }
        
        // Limit length
        return substr($slug, 0, 50);
    }

    /**
     * Try to guess category from title
     * This is optional - admin can change it later
     */
    private function guessCategory(string $title): ?string
    {
        $titleLower = strtolower($title);
        
        // Check for common patterns
        if (str_contains($titleLower, 'demo') || str_contains($titleLower, 'intro')) {
            return 'demo';
        }
        if (str_contains($titleLower, 'test') || str_contains($titleLower, 'exam') || str_contains($titleLower, 'quiz')) {
            return 'test';
        }
        if (str_contains($titleLower, 'practice') || str_contains($titleLower, 'lesson') || str_contains($titleLower, 'exercise')) {
            return 'practice';
        }
        
        return null; // Admin can set category later
    }
}
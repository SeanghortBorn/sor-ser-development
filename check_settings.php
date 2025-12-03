<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Article Settings Check\n\n";

$settings = \App\Models\ArticleSetting::with('article')->orderBy('display_order')->get();

if ($settings->isEmpty()) {
    echo "❌ No settings found!\n";
    exit(1);
}

echo "📋 Current Configuration:\n";
foreach ($settings as $s) {
    $prereq = $s->prerequisite_article_id ? "Requires Article #{$s->prerequisite_article_id}" : "Always available";
    echo "\n{$s->display_order}. {$s->article->title} (ID: {$s->article->id})\n";
    echo "   Availability: {$s->availability_mode}\n";
    echo "   Prerequisite: {$prereq}\n";
    echo "   Typing Mode: {$s->typing_mode}\n";
    echo "   Active: " . ($s->is_active ? 'Yes' : 'No') . "\n";
}

// Test with Group A user
$user = \App\Models\User::whereHas('roles', function($q) {
    $q->where('name', 'Group A: NLP-only');
})->first();

if ($user) {
    echo "\n\n👤 Testing with: {$user->email}\n";
    
    $service = new \App\Services\ArticleProgressionService();
    $available = $service->getAvailableArticles($user->id);
    
    echo "Available articles: {$available->count()}\n";
    foreach ($available as $a) {
        echo "  ✅ {$a->title}\n";
    }
    
    $totalArticles = \App\Models\Article::count();
    $locked = $totalArticles - $available->count();
    echo "Locked articles: {$locked}\n";
}

echo "\n✅ Check complete!\n";
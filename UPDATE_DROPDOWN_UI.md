# Update Instructions for Dropdown UI

The refactored Index.jsx file needs the UI section updated to use the dropdown interface instead of the card layout.

## What to Replace

Find this section in `resources/js/Pages/HomophoneChecks/Index.jsx` (around lines 425-446):

```jsx
                            {/* Audio Player */}
                            <AudioPlayer
                                audioRef={audioPlayer.audioRef}
                                audioUrl={audioPlayer.audioUrl}
                                isPlaying={audioPlayer.isPlaying}
                                currentTime={audioPlayer.currentTime}
                                duration={audioPlayer.duration}
                                onTogglePlay={audioPlayer.togglePlay}
                                onSkipBackward={audioPlayer.skipBackward}
                                onSkipForward={audioPlayer.skipForward}
                                onSeek={audioPlayer.handleSeek}
                                onTimeUpdate={audioPlayer.handleTimeUpdate}
                                onLoadedMetadata={audioPlayer.handleLoadedMetadata}
                                onEnded={audioPlayer.handleAudioEnded}
                            />

                            {/* Article Selector */}
                            <ArticleSelector
                                articles={articles}
                                selectedArticle={selectedArticle}
                                onSelectArticle={handleSelectArticle}
                            />
```

## Replace With

Since the replacement is very large (200+ lines of JSX), I recommend:

### Option 1: Copy from backup
1. Open your backup file: `resources/js/Pages/HomophoneChecks/Index.jsx.backup`
2. Copy the section starting from `{/* Title and Article Dropdown */}` (around line 1020)
3. Copy until just before `{/* Textarea */}` (around line 1246)
4. Replace the AudioPlayer and ArticleSelector section with this copied content

### Option 2: Manual restoration
Simply restore the original Index.jsx.backup and then reapply these optimizations:
- Keep the imports for the hooks and modals
- Keep the refactored modal components at the bottom
- Keep the custom hooks usage (useHomophoneStats, useAudioPlayer)
- Just change the UI rendering section back to the dropdown style

## Files Already Updated:
- ✅ Dropdown state added (`dropdownOpen`, `dropdownRef`)
- ✅ Outside click handler added
- ✅ `formatTime` utility added
- ✅ `handleSelectArticle` closes dropdown
- ✅ Unused imports removed

## What's Missing:
- ❌ The JSX rendering section (AudioPlayer + ArticleSelector components → Dropdown UI)

The system is preventing me from making this large edit directly due to file size. Please use one of the options above to complete the UI update.

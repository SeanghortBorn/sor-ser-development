# Component Splitting Guide

## Overview

Large components (500+ lines) are difficult to maintain, test, and understand. This guide outlines the strategy for splitting `HomophoneChecks/Index.jsx` (936 lines) into smaller, focused components.

---

## HomophoneChecks/Index.jsx Analysis

### Current Structure (936 lines)
- **State variables:** 20+
- **Custom hooks:** 3
- **Modal components:** 5
- **Functions:** 15+
- **Responsibilities:** Too many!

### Problems
- ❌ Single Responsibility Principle violated
- ❌ Hard to test individual features
- ❌ Difficult to debug
- ❌ Code reuse is challenging
- ❌ Performance optimization limited

---

## Splitting Strategy

### Component Hierarchy

```
HomophoneCheckPage (Main Container - ~150 lines)
├── ArticleSelectionSidebar (~100 lines)
│   ├── ArticleList
│   └── ArticleCard
├── EditorSection (~200 lines)
│   ├── EditorHeader
│   ├── TextEditor
│   └── LiveProgressBar
├── ComparisonSection (~150 lines)
│   ├── ComparisonResults
│   └── WordDiffViewer
├── StatisticsPanel (~80 lines)
│   └── MetricCard
└── Modals (Keep existing)
    ├── DetailsModal
    ├── HistoryModal
    ├── HistoryDetailModal
    └── CompletionModal
```

---

## New Component Structure

### 1. HomophoneCheckPage (Main Container)
**Purpose:** Orchestrate data flow and state management
**Responsibilities:**
- Manage global state (with Zustand)
- Handle API calls
- Coordinate between child components
- Manage modals

**Size:** ~150 lines

---

### 2. ArticleSelectionSidebar
**Purpose:** Display and manage article selection
**Responsibilities:**
- List available articles
- Handle article selection
- Display article metadata
- Show completion status

**Props:**
```javascript
{
  articles: Array,
  selectedArticle: Object,
  onSelectArticle: Function,
  loading: Boolean
}
```

**Size:** ~100 lines

---

### 3. EditorSection
**Purpose:** Text input and live progress tracking
**Responsibilities:**
- Text input area
- Character/word counting
- Auto-save functionality
- Live progress display

**Props:**
```javascript
{
  article: Object,
  userText: String,
  onTextChange: Function,
  progress: Object,
  autoSave: Boolean
}
```

**Size:** ~200 lines

**Sub-components:**
- `EditorHeader` - Title, word count, save status
- `TextEditor` - Textarea with features
- `LiveProgressBar` - Real-time progress

---

### 4. ComparisonSection
**Purpose:** Display comparison results
**Responsibilities:**
- Show side-by-side comparison
- Highlight differences
- Display accuracy metrics
- Word-by-word diff

**Props:**
```javascript
{
  originalText: String,
  userText: String,
  comparisonResults: Object,
  onAccept: Function,
  onDismiss: Function
}
```

**Size:** ~150 lines

**Sub-components:**
- `ComparisonResults` - Overview and metrics
- `WordDiffViewer` - Word-by-word comparison

---

### 5. StatisticsPanel
**Purpose:** Display session and historical statistics
**Responsibilities:**
- Show current session stats
- Display historical averages
- Render progress charts
- Show achievements

**Props:**
```javascript
{
  currentStats: Object,
  historicalStats: Object,
  bestAccuracy: Number
}
```

**Size:** ~80 lines

**Sub-components:**
- `MetricCard` - Individual metric display

---

## State Management Strategy

### Before (Component State)
```javascript
// Inside HomophoneChecks/Index.jsx
const [selectedArticle, setSelectedArticle] = useState(null);
const [paragraph, setParagraph] = useState("");
const [comparisonResult, setComparisonResult] = useState(null);
// ... 20+ more state variables
```

### After (Zustand Store)
```javascript
// Use existing useHomophoneStore
const {
  selectedArticle,
  userText,
  comparisonResults,
  setUserText,
  calculateAccuracy
} = useHomophoneStore();
```

---

## API Calls Centralization

### Before (Inline API calls)
```javascript
// Inside component
const handleSave = async () => {
  await axios.post('/api/save', data);
};
```

### After (API Service)
```javascript
// services/homophoneApi.js
export const homophoneApi = {
  saveProgress: (data) => axios.post('/api/save', data),
  checkText: (data) => axios.post('/api/check', data),
  getHistory: (articleId) => axios.get(`/api/history/${articleId}`)
};

// In component
import { homophoneApi } from '@/services/homophoneApi';

const handleSave = async () => {
  await homophoneApi.saveProgress(data);
};
```

---

## File Structure

```
resources/js/
├── Pages/
│   └── HomophoneChecks/
│       └── Index.jsx (Main container - ~150 lines)
├── Components/
│   └── HomophoneChecks/
│       ├── ArticleSelectionSidebar.jsx
│       ├── ArticleCard.jsx
│       ├── EditorSection.jsx
│       ├── EditorHeader.jsx
│       ├── TextEditor.jsx
│       ├── ComparisonSection.jsx
│       ├── ComparisonResults.jsx
│       ├── WordDiffViewer.jsx
│       ├── StatisticsPanel.jsx
│       ├── MetricCard.jsx
│       ├── DetailsModal.jsx (existing)
│       ├── HistoryModal.jsx (existing)
│       ├── HistoryDetailModal.jsx (existing)
│       ├── CompletionModal.jsx (existing)
│       └── LiveProgressBar.jsx (existing)
├── services/
│   └── homophoneApi.js (New - API calls)
└── stores/
    └── useHomophoneStore.js (Already created)
```

---

## Migration Steps

### Step 1: Create API Service
```bash
touch resources/js/services/homophoneApi.js
```

### Step 2: Extract Components (One at a time)
```bash
# Start with smallest components first
touch resources/js/Components/HomophoneChecks/MetricCard.jsx
touch resources/js/Components/HomophoneChecks/ArticleCard.jsx
touch resources/js/Components/HomophoneChecks/EditorHeader.jsx

# Then medium components
touch resources/js/Components/HomophoneChecks/WordDiffViewer.jsx
touch resources/js/Components/HomophoneChecks/ComparisonResults.jsx

# Then larger sections
touch resources/js/Components/HomophoneChecks/StatisticsPanel.jsx
touch resources/js/Components/HomophoneChecks/TextEditor.jsx
touch resources/js/Components/HomophoneChecks/ComparisonSection.jsx
touch resources/js/Components/HomophoneChecks/EditorSection.jsx
touch resources/js/Components/HomophoneChecks/ArticleSelectionSidebar.jsx
```

### Step 3: Refactor Main Component
- Move state to Zustand store
- Replace inline code with component imports
- Simplify event handlers
- Remove duplicate logic

### Step 4: Test Each Component
- Unit tests for each component
- Integration tests for main page
- Visual regression tests

---

## Benefits After Splitting

### Before
- 936 lines in one file
- 20+ state variables
- Hard to understand flow
- Difficult to test
- Poor performance optimization

### After
- Main file: ~150 lines
- 10 focused components (~80-150 lines each)
- Clear responsibilities
- Easy to test
- Better performance (React.memo, lazy loading)

---

## Testing Strategy

### Component Tests
```javascript
describe('ArticleSelectionSidebar', () => {
  it('renders article list', () => {
    render(<ArticleSelectionSidebar articles={mockArticles} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('handles article selection', () => {
    const onSelect = vi.fn();
    render(<ArticleSelectionSidebar onSelectArticle={onSelect} />);

    fireEvent.click(screen.getByText('Article 1'));
    expect(onSelect).toHaveBeenCalledWith(mockArticles[0]);
  });
});
```

---

## Performance Optimization

### Memoization
```javascript
import { memo } from 'react';

// Prevent re-renders when props don't change
export const ArticleCard = memo(({ article, onSelect }) => {
  return <div onClick={() => onSelect(article)}>...</div>;
});
```

### Lazy Loading
```javascript
import { lazy, Suspense } from 'react';

const ComparisonSection = lazy(() => import('./ComparisonSection'));

<Suspense fallback={<LoadingSpinner />}>
  {showComparison && <ComparisonSection />}
</Suspense>
```

---

## Code Quality Improvements

### Before
- Single file with everything
- Mixed concerns
- Hard to navigate

### After
- Single responsibility per component
- Clear separation of concerns
- Easy to find and fix issues
- Better code organization

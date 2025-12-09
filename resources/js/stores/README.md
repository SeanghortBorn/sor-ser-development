# Zustand State Management Documentation

This directory contains all Zustand stores for global state management across the application.

## Why Zustand?

- ✅ **Simple API** - No boilerplate, no context providers
- ✅ **Lightweight** - Only 1.2kb gzipped
- ✅ **TypeScript Ready** - Full type inference
- ✅ **Persistence** - Easy localStorage integration
- ✅ **Performance** - Component re-renders only when subscribed state changes
- ✅ **DevTools** - Redux DevTools integration available

---

## Available Stores

### 1. useAuthStore
**Purpose:** Manage user authentication, permissions, and roles

**State:**
- `user` - Current user object
- `permissions` - Array of user permissions
- `roles` - Array of user roles
- `isAuthenticated` - Boolean authentication status

**Key Methods:**
- `setUser(user)` - Set current user
- `can(permission)` - Check if user has permission
- `hasRole(role)` - Check if user has role
- `isAdmin()` - Check if user is admin
- `logout()` - Clear auth data

**Example:**
```javascript
import { useAuthStore } from '@/stores';

function MyComponent() {
    const { user, can, isAdmin, logout } = useAuthStore();

    if (!user) return <div>Please log in</div>;

    return (
        <div>
            <p>Welcome, {user.name}!</p>

            {can('articles.edit') && (
                <button>Edit Article</button>
            )}

            {isAdmin() && (
                <button>Admin Panel</button>
            )}

            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

---

### 2. useArticleStore
**Purpose:** Manage articles, selection, and filtering

**State:**
- `articles` - Array of articles
- `selectedArticle` - Currently selected article
- `filters` - Active filters (search, category, status)
- `loading` - Loading state
- `error` - Error state

**Key Methods:**
- `setArticles(articles)` - Set articles list
- `setSelectedArticle(article)` - Select an article
- `setFilters(filters)` - Update filters
- `getFilteredArticles()` - Get filtered results
- `markAsCompleted(id)` - Mark article as done
- `getStats()` - Get completion statistics

**Example:**
```javascript
import { useArticleStore } from '@/stores';

function ArticleList() {
    const {
        articles,
        filters,
        setFilters,
        getFilteredArticles,
        getStats,
    } = useArticleStore();

    const filteredArticles = getFilteredArticles();
    const stats = getStats();

    return (
        <div>
            <p>Completed: {stats.completed} / {stats.total} ({stats.percentage}%)</p>

            <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
            />

            {filteredArticles.map(article => (
                <div key={article.id}>{article.title}</div>
            ))}
        </div>
    );
}
```

---

### 3. useHomophoneStore
**Purpose:** Manage homophone checking session state

**State:**
- `articleId` - Current article ID
- `userText` - User's typed text
- `originalText` - Original article text
- `comparisonResults` - Comparison results
- `metrics` - Accuracy, time, word counts
- `hasChanges` - Unsaved changes flag

**Key Methods:**
- `initializeSession(articleId, originalText)` - Start new session
- `setUserText(text)` - Update user text
- `calculateAccuracy()` - Calculate accuracy percentage
- `getSessionSummary()` - Get summary for saving
- `resetSession()` - Clear session

**Example:**
```javascript
import { useHomophoneStore } from '@/stores';

function HomophoneCheck() {
    const {
        userText,
        setUserText,
        metrics,
        calculateAccuracy,
        getProgress,
        hasChanges,
    } = useHomophoneStore();

    const handleTextChange = (e) => {
        setUserText(e.target.value);
        calculateAccuracy();
    };

    return (
        <div>
            <p>Progress: {getProgress()}%</p>
            <p>Accuracy: {metrics.accuracy}%</p>
            {hasChanges && <span>Unsaved changes</span>}

            <textarea
                value={userText}
                onChange={handleTextChange}
            />
        </div>
    );
}
```

---

### 4. useQuizStore
**Purpose:** Manage quiz state and answers

**State:**
- `quiz` - Current quiz object
- `questions` - Array of questions
- `currentQuestionIndex` - Current question number
- `answers` - User answers object
- `score` - Quiz score
- `isComplete` - Completion status

**Key Methods:**
- `initializeQuiz(quiz, questions)` - Start quiz
- `setAnswer(questionId, answer)` - Save answer
- `nextQuestion()` - Move to next question
- `previousQuestion()` - Move to previous question
- `completeQuiz(score)` - Finish quiz
- `getSummary()` - Get quiz summary

**Example:**
```javascript
import { useQuizStore } from '@/stores';

function QuizPage() {
    const {
        getCurrentQuestion,
        setAnswer,
        nextQuestion,
        getProgress,
        areAllQuestionsAnswered,
        canSubmit,
    } = useQuizStore();

    const question = getCurrentQuestion();

    return (
        <div>
            <p>Progress: {getProgress()}%</p>

            <h3>{question.question}</h3>
            {question.options.map(option => (
                <button
                    key={option.id}
                    onClick={() => setAnswer(question.id, option.id)}
                >
                    {option.text}
                </button>
            ))}

            <button onClick={nextQuestion}>Next</button>

            {canSubmit() && (
                <button>Submit Quiz</button>
            )}
        </div>
    );
}
```

---

### 5. useNotificationStore
**Purpose:** Manage toast notifications and alerts

**State:**
- `notifications` - Array of active notifications

**Key Methods:**
- `success(message, title, options)` - Show success toast
- `error(message, title, options)` - Show error toast
- `warning(message, title, options)` - Show warning toast
- `info(message, title, options)` - Show info toast
- `loading(message, title, options)` - Show loading toast
- `removeNotification(id)` - Remove notification
- `clearAll()` - Clear all notifications

**Example:**
```javascript
import { useNotificationStore } from '@/stores';

function MyForm() {
    const { success, error } = useNotificationStore();

    const handleSubmit = async (data) => {
        try {
            await saveData(data);
            success('Data saved successfully!');
        } catch (err) {
            error('Failed to save data', 'Error');
        }
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Best Practices

### 1. Importing Stores
```javascript
// ✅ Good - Import from index
import { useAuthStore, useNotificationStore } from '@/stores';

// ❌ Bad - Direct import
import useAuthStore from '@/stores/useAuthStore';
```

### 2. Selecting State
```javascript
// ✅ Good - Select only what you need
const user = useAuthStore(state => state.user);
const canEdit = useAuthStore(state => state.can('articles.edit'));

// ❌ Bad - Subscribe to entire store (causes unnecessary re-renders)
const { user, permissions, roles, isAdmin, can } = useAuthStore();
```

### 3. Using Actions
```javascript
// ✅ Good - Destructure actions separately
function MyComponent() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);

    return <button onClick={logout}>Logout</button>;
}

// ✅ Also Good - Destructure both state and actions
function MyComponent() {
    const { user, logout } = useAuthStore();

    return <button onClick={logout}>Logout</button>;
}
```

### 4. Avoid Prop Drilling
```javascript
// ❌ Bad - Prop drilling
<Parent>
    <Child user={user} />
</Parent>

// ✅ Good - Use store directly in child
function Child() {
    const user = useAuthStore(state => state.user);
    return <div>{user.name}</div>;
}
```

### 5. Combining Multiple Stores
```javascript
function Dashboard() {
    const user = useAuthStore(state => state.user);
    const articles = useArticleStore(state => state.articles);
    const { success } = useNotificationStore();

    const handleComplete = (articleId) => {
        // Update article store
        useArticleStore.getState().markAsCompleted(articleId);

        // Show notification
        success('Article completed!');
    };

    return (
        <div>
            <h1>Welcome, {user.name}</h1>
            {/* ... */}
        </div>
    );
}
```

---

## Testing with Zustand

### Mocking Stores in Tests
```javascript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores';

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useAuthStore.getState().logout();
    });

    it('sets user correctly', () => {
        const { result } = renderHook(() => useAuthStore());

        act(() => {
            result.current.setUser({
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
            });
        });

        expect(result.current.user.name).toBe('John Doe');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('checks permissions correctly', () => {
        const { result } = renderHook(() => useAuthStore());

        act(() => {
            result.current.setUser({
                id: 1,
                name: 'John',
                permissions: ['articles.edit', 'articles.view'],
            });
        });

        expect(result.current.can('articles.edit')).toBe(true);
        expect(result.current.can('users.delete')).toBe(false);
    });
});
```

---

## Performance Optimization

### 1. Selective Subscriptions
```javascript
// ✅ Optimal - Only re-renders when user.name changes
const userName = useAuthStore(state => state.user?.name);

// ❌ Suboptimal - Re-renders on any auth store change
const { user } = useAuthStore();
const userName = user?.name;
```

### 2. Memoization
```javascript
import { useMemo } from 'react';

function ArticleList() {
    const getFilteredArticles = useArticleStore(state => state.getFilteredArticles);

    // Memoize filtered results
    const filteredArticles = useMemo(() => {
        return getFilteredArticles();
    }, [getFilteredArticles]);

    return <div>...</div>;
}
```

### 3. Shallow Equality
```javascript
import { shallow } from 'zustand/shallow';

// Only re-renders if articles array actually changes
const articles = useArticleStore(state => state.articles, shallow);
```

---

## Migration from Props/Context

### Before (Props)
```javascript
// Parent.jsx
<Child user={user} onLogout={handleLogout} />

// Child.jsx
function Child({ user, onLogout }) {
    return <div>{user.name}</div>;
}
```

### After (Zustand)
```javascript
// Parent.jsx
<Child />

// Child.jsx
function Child() {
    const { user, logout } = useAuthStore();
    return <div>{user.name}</div>;
}
```

---

## Debugging

### 1. Log Store State
```javascript
// In browser console
useAuthStore.getState(); // View current state
useAuthStore.getState().user; // View specific value
```

### 2. Subscribe to Changes
```javascript
// Watch for changes
useAuthStore.subscribe((state, prevState) => {
    console.log('Auth state changed:', state);
});
```

### 3. Redux DevTools Integration
```javascript
import { devtools } from 'zustand/middleware';

const useAuthStore = create(
    devtools(
        (set, get) => ({
            // ... your store
        }),
        { name: 'AuthStore' }
    )
);
```

---

## Further Reading

- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Zustand Recipes](https://github.com/pmndrs/zustand/wiki/Recipes)
- [Performance Optimization](https://zustand.docs.pmnd.rs/guides/performance)

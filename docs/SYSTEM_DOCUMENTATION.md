# Sor-Ser Application - Complete System Documentation

**Version**: 1.0.0
**Last Updated**: 2025-12-09
**Documentation Type**: Complete System Reference

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Features & Modules](#features--modules)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Documentation](#api-documentation)
11. [State Management](#state-management)
12. [Setup & Installation](#setup--installation)
13. [Development Workflow](#development-workflow)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [Maintenance & Updates](#maintenance--updates)

---

## System Overview

### What is Sor-Ser?

Sor-Ser is a comprehensive **Khmer Language Learning Platform** that helps users improve their Khmer typing skills, grammar understanding, and language proficiency through interactive exercises, homophone checking, and real-time feedback.

### Core Purpose

- **Homophone Checking**: Help users identify and correct homophone errors in Khmer text
- **Grammar Practice**: Interactive grammar exercises with real-time feedback
- **Progress Tracking**: Detailed analytics on typing speed, accuracy, and improvement
- **Adaptive Learning**: Progressive article unlocking based on user performance
- **Audio Integration**: Pronunciation guides and audio playback for articles

### Target Users

- **Students**: Learning Khmer language fundamentals
- **Instructors**: Managing student progress and content
- **Administrators**: System configuration and user management

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.2+ | Server-side language |
| **Laravel** | 12.0 | Web application framework |
| **MySQL** | 8.0+ | Primary database |
| **Inertia.js** | 2.0 | Server-side rendering without API |
| **Spatie Permission** | Latest | Role & permission management |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI library |
| **Inertia React** | 2.0.0 | React adapter for Inertia.js |
| **TailwindCSS** | 4.0.0 | Utility-first CSS framework |
| **Zustand** | 5.0.2 | State management |
| **Vite** | 7.1.12 | Build tool & dev server |
| **Lucide React** | 0.543.0 | Icon library |
| **Framer Motion** | 12.23.22 | Animation library |
| **Recharts** | 3.5.1 | Charting library |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **PHPUnit** | Backend testing |
| **Husky** | Git hooks |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │   React    │  │   Zustand    │  │  TailwindCSS│    │
│  │  (UI Layer)│  │(State Mgmt)  │  │  (Styling)  │    │
│  └─────┬──────┘  └──────┬───────┘  └─────────────┘    │
│        └─────────────────┼──────────────────────────────┘
│                          │
│                   Inertia.js (SPA)
│                          │
├──────────────────────────┼──────────────────────────────┐
│                    Laravel Backend                       │
│  ┌────────────┐  ┌──────┴───────┐  ┌─────────────┐    │
│  │Controllers │  │ Repositories │  │  Services   │    │
│  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘    │
│        │                 │                  │           │
│  ┌─────┴─────────────────┴──────────────────┴──────┐   │
│  │              Models (Eloquent ORM)              │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                               │
├────────────────────────┼───────────────────────────────┤
│                   MySQL Database                        │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Users  │ │Articles│ │Homophones│ │Activities│    │
│  └─────────┘ └────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User Action (Click, Type, Submit)
   ↓
2. React Component Handler
   ↓
3. Zustand Store Update (if needed)
   ↓
4. Inertia.js Request to Laravel
   ↓
5. Laravel Route → Controller
   ↓
6. Service Layer (Business Logic)
   ↓
7. Repository Layer (Data Access)
   ↓
8. Eloquent Model → Database
   ↓
9. Response back through layers
   ↓
10. Inertia.js renders React component
```

### Data Flow Patterns

#### **1. Standard CRUD Operations**
```
User Action → React Component → Inertia Request → Controller →
Repository → Model → Database → Response → React Update
```

#### **2. Real-time Comparison**
```
User Types → Debounced Auto-save → Local State Update →
Zustand Store → Background API Call → Comparison Engine →
Results → Component Re-render
```

#### **3. Audio Playback**
```
Article Selection → Audio Hook → Fetch Audio URL →
Audio Element → Playback Controls → Activity Tracking
```

---

## Project Structure

```
sor-ser-development/
├── app/
│   ├── Console/              # Artisan commands
│   ├── Events/               # Event classes
│   ├── Exceptions/           # Exception handlers
│   ├── Http/
│   │   ├── Controllers/      # Route controllers
│   │   ├── Middleware/       # HTTP middleware
│   │   └── Requests/         # Form requests
│   ├── Jobs/                 # Queue jobs
│   ├── Listeners/            # Event listeners
│   ├── Models/               # Eloquent models
│   ├── Policies/             # Authorization policies
│   ├── Providers/            # Service providers
│   ├── Repositories/         # Repository pattern
│   └── Services/             # Business logic services
├── bootstrap/                # Bootstrap files
├── config/                   # Configuration files
├── database/
│   ├── factories/            # Model factories
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
├── docs/                     # Documentation
│   ├── PHASE_3_COMPLETION_SUMMARY.md
│   ├── VITE_OPTIMIZATION_GUIDE.md
│   ├── COMPONENT_SPLITTING_GUIDE.md
│   ├── HOMOPHONE_PAGE_REFACTORING.md
│   └── SYSTEM_DOCUMENTATION.md (this file)
├── public/                   # Public assets
│   ├── build/                # Compiled assets (generated)
│   ├── images/               # Public images
│   └── index.php             # Entry point
├── resources/
│   ├── css/                  # CSS files
│   ├── js/
│   │   ├── Components/       # React components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingFallback.jsx
│   │   │   ├── HomophoneChecks/  # Feature components
│   │   │   ├── GrammarChecks/
│   │   │   └── ...
│   │   ├── Pages/            # Inertia pages
│   │   │   ├── Dashboard/
│   │   │   ├── HomophoneChecks/
│   │   │   ├── Auth/
│   │   │   └── ...
│   │   ├── stores/           # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useHomophoneStore.js
│   │   │   ├── useNotificationStore.js
│   │   │   └── index.js
│   │   ├── services/         # API services
│   │   │   └── homophoneApi.js
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   │   └── lazyLoad.jsx
│   │   └── app.jsx           # React entry point
│   └── views/                # Blade templates
├── routes/
│   ├── web.php               # Web routes
│   ├── api.php               # API routes
│   └── console.php           # Console routes
├── storage/                  # Storage directory
│   ├── app/                  # Application storage
│   ├── framework/            # Framework storage
│   └── logs/                 # Log files
├── tests/                    # Tests
│   ├── Feature/              # Feature tests
│   └── Unit/                 # Unit tests
├── vendor/                   # Composer dependencies
├── .env                      # Environment variables
├── .env.example              # Example environment
├── artisan                   # Artisan CLI
├── composer.json             # PHP dependencies
├── package.json              # NPM dependencies
├── phpunit.xml               # PHPUnit config
├── vite.config.js            # Vite configuration
└── vitest.config.js          # Vitest configuration
```

---

## Database Schema

### Core Tables

#### **users**
User accounts and authentication

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(255) | User's full name |
| email | varchar(255) | Unique email |
| password | varchar(255) | Hashed password |
| google_id | varchar(255) | Google OAuth ID |
| is_admin | boolean | Admin flag |
| email_verified_at | timestamp | Email verification |
| two_factor_secret | text | 2FA secret |
| remember_token | varchar(100) | Remember me token |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **articles**
Content for homophone checking exercises

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| title | varchar(255) | Article title |
| content | longtext | Article text |
| category_id | bigint | Foreign key to categories |
| audios_id | bigint | Foreign key to audios |
| word_count | int | Number of words |
| difficulty_level | enum | easy/medium/hard |
| is_published | boolean | Publication status |
| order | int | Display order |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **homophones**
Khmer homophone definitions

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| word | varchar(255) | Khmer word |
| phonetic | varchar(255) | Phonetic spelling |
| meaning | text | Word meaning |
| usage_example | text | Example sentence |
| group_id | bigint | Homophone group ID |
| frequency | int | Usage frequency |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **grammar_checkers**
User typing sessions

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users |
| article_id | bigint | Foreign key to articles |
| title | varchar(255) | Document title |
| paragraph | longtext | User typed text |
| word_count | int | Word count |
| incorrect_word_count | int | Error count |
| reading_time | int | Reading time (min) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **user_article_completions**
Article completion tracking

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users |
| article_id | bigint | Foreign key to articles |
| accuracy | decimal(5,2) | Accuracy percentage |
| typing_speed | int | WPM |
| time_spent | int | Time in seconds |
| grammar_checker_id | bigint | Session reference |
| completed_at | timestamp | Completion time |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **article_settings**
Progressive unlocking configuration

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| mode | enum | sequential/free/none |
| unlocks_after_article_id | bigint | Prerequisite article |
| min_accuracy_required | decimal(5,2) | Minimum accuracy |
| completion_threshold | decimal(5,2) | Pass threshold |
| min_typing_speed | int | Minimum WPM |
| min_typed_words_percentage | decimal(5,2) | Completion % |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **user_activities**
Comprehensive activity tracking

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users |
| grammar_checker_id | bigint | Session reference |
| activity_type | varchar(50) | Activity type |
| activity_data | json | Activity details |
| created_at | timestamp | Activity time |
| updated_at | timestamp | Last update |

### Permission Tables (Spatie)

#### **roles**
User roles

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(255) | Role name |
| guard_name | varchar(255) | Guard name |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **permissions**
System permissions

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(255) | Permission name |
| guard_name | varchar(255) | Guard name |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

#### **role_has_permissions**
Role-permission mapping

| Column | Type | Description |
|--------|------|-------------|
| permission_id | bigint | Foreign key to permissions |
| role_id | bigint | Foreign key to roles |

#### **model_has_permissions**
Direct user permissions

| Column | Type | Description |
|--------|------|-------------|
| permission_id | bigint | Foreign key to permissions |
| model_type | varchar(255) | Model type (User) |
| model_id | bigint | Model ID |

#### **model_has_roles**
User roles

| Column | Type | Description |
|--------|------|-------------|
| role_id | bigint | Foreign key to roles |
| model_type | varchar(255) | Model type (User) |
| model_id | bigint | Model ID |

### Relationship Diagram

```
users
  ├─ has many → grammar_checkers
  ├─ has many → user_article_completions
  ├─ has many → user_activities
  ├─ has many → quiz_attempts
  └─ belongs to many → roles

articles
  ├─ has many → user_article_completions
  ├─ has many → grammar_checkers
  ├─ belongs to → category
  ├─ belongs to → audio
  └─ has one → article_setting

homophones
  ├─ belongs to → homophone_group
  └─ has many → homophone_variants

grammar_checkers
  ├─ belongs to → user
  ├─ belongs to → article
  └─ has many → user_activities

roles
  └─ belongs to many → permissions
```

---

## Features & Modules

### 1. Authentication System

**Features:**
- Email/password registration and login
- Google OAuth integration
- Email verification
- Password reset functionality
- Two-factor authentication (2FA)
- Remember me functionality

**Files:**
- Controllers: `app/Http/Controllers/Auth/`
- Pages: `resources/js/Pages/Auth/`
- Middleware: `app/Http/Middleware/Authenticate.php`

### 2. Homophone Checking Module

**Features:**
- Article selection with progressive unlocking
- Real-time typing with auto-save
- Audio playback for pronunciation
- Text comparison engine
- Accuracy calculation
- Typing speed tracking (WPM)
- Visual diff viewer
- Completion tracking

**Key Components:**
- **Backend:**
  - `KhmerCompareController.php` - Text comparison logic
  - `HomophoneController.php` - Homophone management
  - `ArticleController.php` - Article CRUD

- **Frontend:**
  - `Pages/HomophoneChecks/Index.jsx` - Main page
  - `Components/HomophoneChecks/` - 10+ specialized components
  - `stores/useHomophoneStore.js` - State management
  - `services/homophoneApi.js` - API integration

**User Flow:**
1. User selects an article
2. Audio loads automatically (if available)
3. User types the article content
4. Auto-save triggers every 700ms
5. User clicks "Save" to compare
6. System compares text word-by-word
7. Results show accuracy, errors, typing speed
8. If accuracy ≥ 70%, next article unlocks
9. Completion data saved to database

### 3. Dashboard & Analytics

**Features:**
- User progress overview
- Accuracy trends
- Typing speed graphs
- Activity timeline
- Completion statistics
- Leaderboard

**Components:**
- `Pages/Dashboard/Index.jsx`
- `Components/Dashboard/` - Charts and stats
- Recharts integration for visualizations

### 4. Admin Panel

**Features:**
- User management
- Article management
- System settings
- Permission management
- Content moderation
- Analytics overview

**Access Control:**
- Role: Admin
- Permission: `manage-system`

### 5. Quiz System

**Features:**
- Multiple choice questions
- Timed quizzes
- Score tracking
- Attempt history
- Progress analytics

**Models:**
- `Quiz.php`
- `Question.php`
- `QuizAttempt.php`

### 6. Feedback System

**Features:**
- User feedback submission
- Category-based feedback
- Admin review interface
- Status tracking

**Model:** `Feedback.php`

---

## Frontend Architecture

### Component Structure

```
Components/
├── Layout Components
│   ├── HeaderNavbar.jsx      # Main navigation
│   ├── Footer.jsx             # Footer
│   └── Sidebar.jsx            # Sidebar navigation
│
├── Shared Components
│   ├── ErrorBoundary.jsx      # Error handling
│   ├── LoadingFallback.jsx    # Loading states
│   ├── Modal.jsx              # Modal wrapper
│   └── Button.jsx             # Button component
│
├── Feature Components
│   ├── HomophoneChecks/       # 10 components
│   │   ├── ArticleCard.jsx
│   │   ├── ArticleSelectionSidebar.jsx
│   │   ├── ComparisonResults.jsx
│   │   ├── ComparisonSection.jsx
│   │   ├── EditorHeader.jsx
│   │   ├── EditorSection.jsx
│   │   ├── MetricCard.jsx
│   │   ├── StatisticsPanel.jsx
│   │   ├── TextEditor.jsx
│   │   └── WordDiffViewer.jsx
│   │
│   ├── GrammarChecks/
│   │   └── SidebarCheckGrammar.jsx
│   │
│   └── Dashboard/
│       ├── StatsCard.jsx
│       └── ProgressChart.jsx
│
└── Pages/                     # Inertia pages
    ├── Dashboard/Index.jsx
    ├── HomophoneChecks/Index.jsx
    ├── Auth/Login.jsx
    └── ...
```

### State Management (Zustand)

**Stores:**

1. **useAuthStore.js**
   - User authentication state
   - Permissions and roles
   - Login/logout actions
   - LocalStorage persistence

2. **useHomophoneStore.js**
   - Current article session
   - User typed text
   - Comparison results
   - Metrics (accuracy, words, time)
   - Session management

3. **useNotificationStore.js**
   - Toast notifications
   - Success/error messages
   - Auto-dismiss functionality

4. **useArticleStore.js**
   - Article list management
   - Filtering and sorting
   - Category filtering

5. **useQuizStore.js**
   - Quiz state
   - Current question
   - Answers tracking
   - Score calculation

### Lazy Loading Strategy

**Implemented in:**
- Modal components (DetailsModal, HistoryModal, CompletionModal)
- Heavy feature components
- Route-based code splitting

**Benefits:**
- 40KB smaller initial bundle
- Faster first load
- Better performance

**Configuration:**
```javascript
// vite.config.js
manualChunks: (id) => {
  if (id.includes('HomophoneChecks/')) return 'components-homophone';
  if (id.includes('node_modules/react')) return 'vendor-react';
  // ... more chunking strategies
}
```

### Error Boundaries

**Implementation:**
```javascript
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Coverage:**
- All major page sections
- Modal components
- API call handlers
- Lazy-loaded components

---

## Backend Architecture

### Controller Layer

**Purpose:** Handle HTTP requests, validate input, return responses

**Example:**
```php
class HomophoneController extends Controller
{
    public function index()
    {
        return Inertia::render('HomophoneChecks/Index', [
            'articles' => $this->articleRepository->getAllWithAccess(auth()->id()),
        ]);
    }

    public function compare(Request $request)
    {
        $validated = $request->validate([
            'article_id' => 'required|exists:articles,id',
            'user_input' => 'required|string',
        ]);

        $result = $this->comparisonService->compare(
            $validated['article_id'],
            $validated['user_input']
        );

        return response()->json($result);
    }
}
```

### Service Layer

**Purpose:** Business logic, reusable functionality

**Example:**
```php
class ComparisonService
{
    public function compare($articleId, $userInput)
    {
        $article = Article::findOrFail($articleId);

        // Tokenize words
        $articleWords = $this->tokenize($article->content);
        $userWords = $this->tokenize($userInput);

        // Compare
        $comparison = $this->compareWords($articleWords, $userWords);

        // Calculate accuracy
        $accuracy = $this->calculateAccuracy($comparison);

        return [
            'article_words' => $articleWords,
            'user_words' => $userWords,
            'comparison' => $comparison,
            'accuracy' => $accuracy,
            'stats' => $this->getStats($comparison),
        ];
    }
}
```

### Repository Layer

**Purpose:** Data access, query abstraction

**Example:**
```php
class ArticleRepository
{
    public function getAllWithAccess($userId)
    {
        return Article::with(['category', 'audio', 'setting'])
            ->withUserCompletionData($userId)
            ->withAccessCheck($userId)
            ->orderBy('order')
            ->get();
    }

    public function findWithRelations($id)
    {
        return Article::with(['category', 'audio', 'completions'])
            ->findOrFail($id);
    }
}
```

### Model Layer

**Purpose:** Database representation, relationships, accessors

**Example:**
```php
class Article extends Model
{
    protected $fillable = [
        'title', 'content', 'category_id', 'audios_id',
        'word_count', 'difficulty_level', 'is_published', 'order'
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function audio()
    {
        return $this->belongsTo(Audio::class, 'audios_id');
    }

    public function completions()
    {
        return $this->hasMany(UserArticleCompletion::class);
    }

    public function setting()
    {
        return $this->hasOne(ArticleSetting::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeWithUserCompletionData($query, $userId)
    {
        return $query->with(['completions' => function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->latest()
              ->first();
        }]);
    }
}
```

### Events & Listeners

**Purpose:** Decouple actions, handle side effects

**Example:**
```php
// Event
class ArticleCompleted
{
    public function __construct(
        public User $user,
        public Article $article,
        public float $accuracy
    ) {}
}

// Listener
class UnlockNextArticle
{
    public function handle(ArticleCompleted $event)
    {
        if ($event->accuracy >= 70) {
            $this->articleService->unlockNext(
                $event->user->id,
                $event->article->id
            );
        }
    }
}
```

### Jobs & Queues

**Purpose:** Async processing, long-running tasks

**Example:**
```php
class ProcessTypingAnalytics implements ShouldQueue
{
    public function __construct(
        private int $userId,
        private int $sessionId
    ) {}

    public function handle()
    {
        $analytics = $this->analyticsService->process(
            $this->userId,
            $this->sessionId
        );

        $this->analyticsRepository->save($analytics);
    }
}
```

---

## Authentication & Authorization

### Authentication Flow

```
1. User Registration
   ├─ Email/Password or Google OAuth
   ├─ Email verification sent
   ├─ User created with 'Student' role
   └─ Redirect to dashboard

2. Login
   ├─ Credentials validation
   ├─ Session creation
   ├─ Load permissions/roles
   └─ Redirect to intended page

3. Permission Check
   ├─ Middleware: auth, verified
   ├─ Policy check for resource
   └─ Authorize or 403
```

### Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | System administrator | All permissions |
| **Instructor** | Content manager | manage-content, view-analytics |
| **Student** | Regular user | access-homophone, take-quizzes |

### Permissions

| Permission | Description | Access |
|------------|-------------|--------|
| `manage-system` | Full system access | Admin only |
| `manage-content` | Create/edit content | Admin, Instructor |
| `manage-users` | User management | Admin only |
| `view-analytics` | View all analytics | Admin, Instructor |
| `access-homophone` | Homophone module | All authenticated |
| `take-quizzes` | Quiz access | All authenticated |

### Permission Checking

**Backend (Laravel):**
```php
// In controller
$this->authorize('update', $article);

// In blade/views
@can('manage-content')
    <button>Edit</button>
@endcan

// In code
if (auth()->user()->can('manage-system')) {
    // Admin action
}
```

**Frontend (React):**
```javascript
import { useAuthStore } from '@/stores';

const { can, hasRole } = useAuthStore();

if (can('manage-content')) {
    // Show edit button
}

if (hasRole('Admin')) {
    // Show admin panel
}
```

### Page Permissions

Custom page-level permissions via `PagePermission` model:

```php
PagePermission::create([
    'page_name' => 'homophone-check',
    'required_role' => 'Student',
    'required_permission' => 'access-homophone',
    'is_public' => false,
]);
```

---

## API Documentation

### Authentication Endpoints

#### **POST** `/register`
Register new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "redirect": "/dashboard"
}
```

#### **POST** `/login`
User login

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "remember": true
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "redirect": "/dashboard"
}
```

### Homophone Endpoints

#### **GET** `/homophone-check`
Get articles list

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Introduction to Khmer",
      "content": "...",
      "word_count": 150,
      "can_access": true,
      "is_completed": false,
      "best_accuracy": null
    }
  ]
}
```

#### **POST** `/api/compare`
Compare user text with article

**Request:**
```json
{
  "article_id": 1,
  "user_input": "User typed text..."
}
```

**Response:**
```json
{
  "article_words": ["word1", "word2", ...],
  "user_words": ["word1", "word2", ...],
  "comparison": [
    { "index": 0, "status": "same" },
    { "index": 1, "status": "different", "expected": "word2", "actual": "wrod2" }
  ],
  "accuracy": 95.5,
  "stats": {
    "same": 143,
    "different": 7,
    "missing": 0,
    "extra": 0
  }
}
```

#### **POST** `/homophone-check/{article}/save-completion`
Save completion data

**Request:**
```json
{
  "accuracy": 95.5,
  "typing_speed": 45,
  "time_spent": 300,
  "grammar_checker_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "completion": {
    "id": 456,
    "best_accuracy": 95.5,
    "unlocked_next": true
  }
}
```

### Activity Tracking Endpoints

#### **POST** `/api/track/typing`
Track typing activity

**Request:**
```json
{
  "grammar_checker_id": 123,
  "user_id": 1,
  "character": "a",
  "status": 1
}
```

#### **POST** `/api/track/comparison-action`
Track comparison action

**Request:**
```json
{
  "user_id": 1,
  "article_id": 1,
  "session_id": "session-123",
  "action": "accept",
  "accuracy": 95.5,
  "metadata": { ... }
}
```

---

## State Management

### Zustand Store Pattern

**Store Structure:**
```javascript
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  data: null,
  loading: false,
  error: null,

  // Actions
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Getters
  getData: () => get().data,
}));
```

### Store Usage

**In Components:**
```javascript
import { useHomophoneStore } from '@/stores';

function MyComponent() {
  const { userText, setUserText, calculateAccuracy } = useHomophoneStore();

  const handleChange = (e) => {
    setUserText(e.target.value);
    calculateAccuracy();
  };

  return <input value={userText} onChange={handleChange} />;
}
```

### Persistence

**LocalStorage Persistence:**
```javascript
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

---

## Setup & Installation

### Prerequisites

- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **Node.js**: 18.x or higher
- **NPM**: 9.x or higher
- **MySQL**: 8.0 or higher
- **Git**: Latest version

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/sor-ser-development.git
cd sor-ser-development
```

#### 2. Install PHP Dependencies
```bash
composer install
```

#### 3. Install Node Dependencies
```bash
npm install
```

#### 4. Environment Setup
```bash
# Copy example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 5. Configure Environment Variables

Edit `.env` file:
```env
APP_NAME="Sor-Ser"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sor_ser_db
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback
```

#### 6. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE sor_ser_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

#### 7. Create Sessions Table
```bash
php artisan session:table
php artisan migrate
```

#### 8. Storage Link
```bash
php artisan storage:link
```

#### 9. Build Frontend Assets

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
```

#### 10. Start Development Server
```bash
php artisan serve
```

Visit: `http://localhost:8000`

### First-time Setup

#### Create Admin User
```bash
php artisan tinker

$user = User::create([
    'name' => 'Admin',
    'email' => 'admin@sorser.com',
    'password' => bcrypt('password'),
    'is_admin' => true,
    'email_verified_at' => now(),
]);

$user->assignRole('Admin');
```

#### Seed Permissions
```bash
php artisan db:seed --class=PermissionSeeder
```

---

## Development Workflow

### Daily Development

#### 1. Start Development Servers
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev

# Terminal 3 (optional): Queue worker
php artisan queue:work
```

#### 2. Code Changes

**Backend Changes:**
- Edit PHP files in `app/`
- Changes reflected immediately

**Frontend Changes:**
- Edit React files in `resources/js/`
- Hot Module Replacement (HMR) updates browser automatically

#### 3. Database Changes
```bash
# Create migration
php artisan make:migration create_table_name

# Edit migration file
# database/migrations/YYYY_MM_DD_HHMMSS_create_table_name.php

# Run migration
php artisan migrate

# Rollback (if needed)
php artisan migrate:rollback
```

### Git Workflow

#### Branch Strategy
```
main (production)
  ├─ development (staging)
  │   ├─ feature/new-feature
  │   ├─ bugfix/fix-issue
  │   └─ hotfix/critical-fix
```

#### Commit Convention
```bash
# Feature
git commit -m "feat: add homophone checking feature"

# Bug fix
git commit -m "fix: resolve accuracy calculation error"

# Documentation
git commit -m "docs: update setup instructions"

# Refactor
git commit -m "refactor: extract comparison logic to service"

# Style
git commit -m "style: format code with prettier"

# Test
git commit -m "test: add unit tests for comparison service"
```

### Code Style

#### PHP (PSR-12)
```bash
# Format code
./vendor/bin/pint

# Check style
./vendor/bin/pint --test
```

#### JavaScript (Prettier)
```bash
# Format code
npm run format

# Check style
npm run lint
```

---

## Testing

### Backend Testing (PHPUnit)

#### Run Tests
```bash
# All tests
php artisan test

# Specific test file
php artisan test tests/Feature/HomophoneTest.php

# With coverage
php artisan test --coverage
```

#### Example Test
```php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Article;

class HomophoneTest extends TestCase
{
    public function test_user_can_access_homophone_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/homophone-check');

        $response->assertStatus(200);
    }

    public function test_comparison_calculates_accuracy()
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'content' => 'Hello world',
        ]);

        $response = $this->actingAs($user)
            ->post('/api/compare', [
                'article_id' => $article->id,
                'user_input' => 'Hello world',
            ]);

        $response->assertJson([
            'accuracy' => 100,
        ]);
    }
}
```

### Frontend Testing (Vitest)

#### Run Tests
```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

#### Example Test
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '@/Components/HomophoneChecks/MetricCard';

describe('MetricCard', () => {
  it('renders metric value', () => {
    render(
      <MetricCard
        label="Accuracy"
        value={95.5}
        suffix="%"
        color="green"
      />
    );

    expect(screen.getByText('95.5%')).toBeInTheDocument();
  });
});
```

### Integration Testing

#### Testing Workflow
```bash
# 1. Run backend tests
php artisan test

# 2. Run frontend tests
npm run test

# 3. Manual testing
npm run dev
php artisan serve
```

---

## Deployment

### Production Checklist

#### Pre-deployment

- [ ] Run all tests: `php artisan test && npm run test`
- [ ] Update `.env` for production
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure database credentials
- [ ] Set up mail server
- [ ] Configure queue driver
- [ ] Set up Google OAuth credentials

#### Build Assets
```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci

# Build frontend
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

#### Database Migration
```bash
# Backup database first!
php artisan migrate --force
```

#### File Permissions
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Deployment Platforms

#### Option 1: Traditional Server (Ubuntu)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name sorser.com;
    root /var/www/sor-ser/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### Option 2: Laravel Forge

1. Connect server to Forge
2. Create new site
3. Deploy Git repository
4. Configure deployment script
5. Enable quick deploy

#### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl nodejs npm

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev
RUN npm ci && npm run build

CMD php artisan serve --host=0.0.0.0 --port=8000
```

### Post-deployment

- [ ] Test all critical features
- [ ] Verify database connection
- [ ] Check file uploads work
- [ ] Test authentication flow
- [ ] Verify email sending
- [ ] Monitor error logs
- [ ] Set up SSL certificate
- [ ] Configure backups

---

## Troubleshooting

### Common Issues

#### 1. "Session table doesn't exist"

**Error:**
```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'sessions' doesn't exist
```

**Solution:**
```bash
# Create sessions table
php artisan session:table
php artisan migrate

# Clear cache
php artisan config:clear
php artisan cache:clear
```

#### 2. "Mix manifest not found"

**Error:**
```
Unable to locate Mix file: /public/mix-manifest.json
```

**Solution:**
```bash
# Build assets
npm run build

# For development
npm run dev
```

#### 3. "Class not found"

**Error:**
```
Class 'App\Services\ComparisonService' not found
```

**Solution:**
```bash
# Clear autoload cache
composer dump-autoload

# Clear Laravel cache
php artisan clear-compiled
php artisan cache:clear
```

#### 4. "Permission denied" on storage

**Error:**
```
The stream or file "storage/logs/laravel.log" could not be opened
```

**Solution:**
```bash
# Fix permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 5. Vite not serving assets

**Error:**
```
Failed to resolve module specifier "@/Components/..."
```

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall
npm install

# Restart dev server
npm run dev
```

#### 6. Database connection failed

**Error:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify .env credentials
DB_HOST=127.0.0.1  # not localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Test connection
mysql -u root -p
```

### Debug Mode

**Enable detailed errors:**
```env
APP_DEBUG=true
APP_LOG_LEVEL=debug
```

**Check logs:**
```bash
tail -f storage/logs/laravel.log
```

**Clear all caches:**
```bash
php artisan optimize:clear
```

---

## Maintenance & Updates

### Regular Maintenance

#### Daily
- Monitor error logs
- Check queue status
- Verify backups completed

#### Weekly
- Review user feedback
- Check system performance
- Update content

#### Monthly
- Security updates
- Database optimization
- Code review

### File Cleanup & Codebase Maintenance

**Last Cleanup**: 2025-12-09

#### Automated Cleanup

To keep the codebase clean, regularly check for and remove unused files:

```bash
# Find backup files
find . -type f \( -name "*.backup" -o -name "*.old" -o -name "*.bak" \) \
  | grep -v node_modules | grep -v vendor

# Find temporary files
find . -type f \( -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.swp" \) \
  | grep -v node_modules | grep -v vendor

# Find example/sample files
find . -type f \( -name "*.example" -o -name "*.sample" \) \
  | grep -v node_modules | grep -v vendor
```

#### Cleanup History

**2025-12-09 - Post Phase 3 Cleanup**
- ✅ Removed `resources/js/Pages/HomophoneChecks/Index.jsx.backup` (refactored version committed)
- ✅ Removed `app/Services/PermissionService.php.backup` (consolidated version in use)
- ✅ Removed Laravel Breeze from dependencies (composer update)
- ✅ Updated Laravel Framework: v11.47.0 → v12.41.1
- ✅ Updated Inertia Laravel: v1.3.3 → v2.0.11
- ✅ Updated 17 additional composer packages
- ✅ Removed stella-maris/clock dependency (no longer needed)

#### Safe Files to Keep

The following directories contain auto-generated files that are safe to keep:
- `vendor/` - Composer dependencies (gitignored)
- `node_modules/` - NPM dependencies (gitignored)
- `public/build/` - Production build files (tracked for deployment)
- `storage/framework/cache/` - Application cache (gitignored)
- `storage/framework/sessions/` - Session files (gitignored)
- `storage/framework/views/` - Compiled Blade views (gitignored)
- `storage/logs/` - Application logs (gitignored)
- `node_modules/.vite/` - Vite build cache (gitignored)

#### Files That Should NOT Exist

Remove these if found:
- `*.backup`, `*.old`, `*.bak` - Backup files (use git instead)
- `*.tmp`, `*.temp` - Temporary files
- `*~`, `*.swp` - Editor temporary files
- Unused migration files (check carefully before removing)
- Old service/controller copies (consolidated in Phase 2)

#### Dependency Cleanup

```bash
# Remove unused Composer packages
composer show --tree | grep -E "^\s{2,}"  # Check dependency tree
composer remove package/name  # Remove specific package

# Remove unused NPM packages
npm prune  # Remove packages not in package.json
npm dedupe  # Reduce duplicate packages

# Check for outdated packages
composer outdated  # Backend
npm outdated       # Frontend
```

#### Cache Cleanup

```bash
# Laravel caches
php artisan optimize:clear  # All caches
php artisan config:clear    # Config cache
php artisan route:clear     # Route cache
php artisan view:clear      # View cache
php artisan cache:clear     # Application cache

# Vite cache
rm -rf node_modules/.vite

# Composer cache
composer clear-cache

# NPM cache
npm cache clean --force
```

#### Build Cleanup

```bash
# Clean build artifacts
rm -rf public/build/*
npm run build  # Rebuild

# Clean and reinstall dependencies (if needed)
rm -rf node_modules vendor
composer install
npm install
```

### Update Procedures

#### Backend Updates
```bash
# Update dependencies
composer update

# Run migrations
php artisan migrate

# Clear caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

#### Frontend Updates
```bash
# Update dependencies
npm update

# Check for breaking changes
npm outdated

# Rebuild assets
npm run build
```

### Database Maintenance

#### Optimize Tables
```bash
php artisan db:optimize
```

#### Backup Database
```bash
# Export
mysqldump -u root -p sor_ser_db > backup_$(date +%Y%m%d).sql

# Import
mysql -u root -p sor_ser_db < backup_20251209.sql
```

#### Prune Old Data
```bash
# Delete old sessions
php artisan session:table
DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));

# Prune old activities
php artisan model:prune --model=UserActivity
```

### Monitoring

#### Application Monitoring
- **Error tracking**: Integrate Sentry or Bugsnag
- **Performance**: Use Laravel Telescope
- **Uptime**: Set up monitoring service

#### Server Monitoring
- CPU usage
- Memory usage
- Disk space
- Network traffic

### Backup Strategy

#### What to Backup
- Database (daily)
- User uploads (daily)
- Environment configuration (weekly)
- Code repository (continuous via Git)

#### Backup Script
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sor-ser"

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Storage backup
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz storage/

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

---

## Appendix

### Key Files Reference

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite build configuration |
| `composer.json` | PHP dependencies |
| `package.json` | NPM dependencies |
| `routes/web.php` | Web routes |
| `routes/api.php` | API routes |
| `.env` | Environment variables |
| `config/app.php` | Application config |
| `config/database.php` | Database config |

### Useful Commands

```bash
# Laravel
php artisan list                    # List all commands
php artisan tinker                  # REPL
php artisan make:controller Name    # Create controller
php artisan make:model Name -m      # Create model with migration
php artisan make:migration name     # Create migration
php artisan db:seed                 # Seed database
php artisan queue:work              # Process queue
php artisan schedule:work           # Run scheduler

# Composer
composer require package            # Install package
composer update                     # Update dependencies
composer dump-autoload              # Regenerate autoload

# NPM
npm install package                 # Install package
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run test                        # Run tests

# Git
git status                          # Check status
git add .                           # Stage changes
git commit -m "message"             # Commit
git push origin main                # Push to remote
```

### Additional Resources

- [Laravel Documentation](https://laravel.com/docs/12.x)
- [React Documentation](https://react.dev/)
- [Inertia.js Documentation](https://inertiajs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vite Documentation](https://vitejs.dev/)

### Contact & Support

- **Developer**: Your Name
- **Email**: developer@sorser.com
- **Repository**: https://github.com/your-org/sor-ser-development
- **Issue Tracker**: https://github.com/your-org/sor-ser-development/issues

---

**Last Updated**: 2025-12-09
**Documentation Version**: 1.0.0
**Application Version**: 1.0.0

---

*This documentation is maintained as part of the Sor-Ser project. Please keep it updated as the system evolves.*

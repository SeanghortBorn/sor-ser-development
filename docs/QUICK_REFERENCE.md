# Sor-Ser Quick Reference Card

Quick lookup guide for common tasks and commands.

---

## Essential Commands

### Development Servers
```bash
php artisan serve          # Laravel: http://localhost:8000
npm run dev                # Vite: http://localhost:5173
php artisan queue:work     # Queue worker
```

### Cache Management
```bash
php artisan optimize:clear      # Clear everything
php artisan config:clear        # Clear config cache
php artisan route:clear         # Clear route cache
php artisan view:clear          # Clear compiled views
php artisan cache:clear         # Clear application cache
```

### Database
```bash
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Rollback last migration
php artisan migrate:fresh --seed # Fresh DB with seeds
php artisan db:seed              # Run seeders
php artisan tinker               # Database REPL
```

### Code Generation
```bash
php artisan make:controller NameController  # Controller
php artisan make:model Name -m              # Model + migration
php artisan make:migration create_table     # Migration
php artisan make:seeder NameSeeder          # Seeder
php artisan make:request NameRequest        # Form request
php artisan make:middleware NameMiddleware  # Middleware
```

---

## File Locations

### Backend
```
app/Http/Controllers/     # Controllers
app/Models/               # Eloquent models
app/Services/             # Business logic
app/Repositories/         # Data access
routes/web.php            # Web routes
routes/api.php            # API routes
database/migrations/      # Database migrations
```

### Frontend
```
resources/js/Pages/       # Inertia pages
resources/js/Components/  # React components
resources/js/stores/      # Zustand stores
resources/js/services/    # API services
resources/js/utils/       # Utilities
```

---

## Tech Stack Versions

```
Backend:  PHP 8.2 + Laravel 12.0
Frontend: React 19.0 + Inertia 2.0
Styling:  TailwindCSS 4.0
State:    Zustand 5.0.2
Build:    Vite 7.1.12
Database: MySQL 8.0+
```

---

## Environment Variables

```env
# App
APP_ENV=local|production
APP_DEBUG=true|false
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=sor_ser_db
DB_USERNAME=root
DB_PASSWORD=

# Session
SESSION_DRIVER=database

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Common Routes

```
/                        # Home
/dashboard               # User dashboard
/homophone-check         # Homophone checker
/login                   # Login
/register                # Register
/admin                   # Admin panel (Admin only)
```

---

## Database Tables

### Core Tables
- `users` - User accounts
- `articles` - Content
- `homophones` - Word definitions
- `grammar_checkers` - Typing sessions
- `user_article_completions` - Progress tracking

### Permission Tables
- `roles` - User roles
- `permissions` - System permissions
- `role_has_permissions` - Role permissions
- `model_has_roles` - User roles

---

## Zustand Stores

```javascript
import {
  useAuthStore,           // Authentication
  useHomophoneStore,      // Homophone sessions
  useNotificationStore,   // Toast notifications
  useArticleStore,        // Article management
  useQuizStore           // Quiz state
} from '@/stores';
```

---

## API Endpoints

### Homophone
```
GET  /homophone-check              # Get articles
POST /api/compare                  # Compare text
POST /homophone-check/{id}/save    # Save completion
```

### Activity Tracking
```
POST /api/track/typing             # Track keystrokes
POST /api/track/comparison-action  # Track actions
```

---

## Permissions

### Roles
- **Admin** - Full system access
- **Instructor** - Content management
- **Student** - Basic access

### Key Permissions
- `manage-system` - Admin only
- `manage-content` - Admin, Instructor
- `access-homophone` - All authenticated
- `take-quizzes` - All authenticated

---

## Testing

```bash
# Backend
php artisan test                    # All tests
php artisan test --coverage         # With coverage

# Frontend
npm run test                        # All tests
npm run test:ui                     # With UI
npm run test:coverage               # With coverage
```

---

## Build & Deploy

```bash
# Production Build
composer install --optimize-autoloader --no-dev
npm ci
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Deploy
git push origin main
```

---

## Troubleshooting

### Sessions Error
```bash
php artisan session:table
php artisan migrate
php artisan config:clear
```

### Permission Error
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Autoload Error
```bash
composer dump-autoload
php artisan clear-compiled
```

### Vite Error
```bash
rm -rf node_modules/.vite
npm install
npm run dev
```

---

## Useful Snippets

### Create Admin User
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

### Check User Permissions
```bash
php artisan tinker

$user = User::find(1);
$user->getAllPermissions();
$user->getRoleNames();
```

### Database Backup
```bash
mysqldump -u root -p sor_ser_db > backup.sql
```

---

## Component Patterns

### Error Boundary
```javascript
<ErrorBoundary fallback={<Error />}>
  <Component />
</ErrorBoundary>
```

### Lazy Loading
```javascript
import { lazyLoad } from '@/utils/lazyLoad';

const Modal = lazyLoad(
  () => import('@/Components/Modal'),
  { fallback: <Loader /> }
);
```

### Zustand Store
```javascript
const { data, setData, loading } = useStore();
```

---

## Git Commands

```bash
git status                     # Check status
git add .                      # Stage all
git commit -m "message"        # Commit
git push origin main           # Push
git pull origin main           # Pull
git checkout -b feature/name   # New branch
```

---

## Log Monitoring

```bash
tail -f storage/logs/laravel.log    # Watch Laravel logs
tail -f /var/log/nginx/error.log    # Watch Nginx logs
```

---

## Cleanup Commands

### Quick Cleanup
```bash
# Find and remove backup files
find . -type f -name "*.backup" -o -name "*.old" | grep -v node_modules | xargs rm -f

# Clear all Laravel caches
php artisan optimize:clear

# Clear Vite cache
rm -rf node_modules/.vite

# Remove unused npm packages
npm prune
```

### Dependency Updates
```bash
# Update backend dependencies
composer update

# Update frontend dependencies
npm update

# Check for outdated packages
composer outdated && npm outdated
```

---

**For detailed information, see [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)**

**Last Updated**: 2025-12-09

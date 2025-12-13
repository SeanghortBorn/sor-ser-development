<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements MustVerifyEmail, JWTSubject
{
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use HasRoles;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'token',
        'age',
        'education_level',
        'khmer_experience',
        'google_id',
        'is_admin',
        'otp_code',
        'otp_expires_at',
        'email_verification_sent_at',
        'email_verified_at', // Allow mass assignment for OTP verification
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'otp_expires_at' => 'datetime',
            'email_verification_sent_at' => 'datetime',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Check if user is admin
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->hasRole('Admin');
    }

    /**
     * Check if user is teacher
     *
     * @return bool
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('Teacher');
    }

    /**
     * Check if user is student
     *
     * @return bool
     */
    public function isStudent(): bool
    {
        return $this->hasRole('Student');
    }

    /**
     * Make this user an admin
     *
     * @return void
     */
    public function makeAdmin(): void
    {
        $this->is_admin = true;
        $this->save();
        
        if (!$this->hasRole('Admin')) {
            $this->assignRole('Admin');
        }
    }

    /**
     * Remove admin privileges
     *
     * @return void
     */
    public function removeAdmin(): void
    {
        $this->is_admin = false;
        $this->save();
        
        if ($this->hasRole('Admin')) {
            $this->removeRole('Admin');
        }
    }

    /**
     * Relationships
     */
    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    public function userActivities()
    {
        return $this->hasMany(UserActivity::class);
    }

    public function homophoneAccuracies()
    {
        return $this->hasMany(UserHomophoneAccuracy::class);
    }

    /**
     * Get the user's article completions
     */
    public function articleCompletions()
    {
        return $this->hasMany(UserArticleCompletion::class);
    }
}
<?php

namespace Blessedjasonmwanza\ArtisanUi\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class ArtisanUiUser extends Authenticatable
{
    use Notifiable;

    /**
     * Explicitly use the dedicated Artisan UI users table.
     * This prevents collision with the application users table.
     *
     * @var string
     */
    protected $table = 'artisan_ui_users';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];
}

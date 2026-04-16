<?php

namespace Blessedjasonmwanza\ArtisanUi\Models;

use Illuminate\Database\Eloquent\Model;

class ArtisanUiLog extends Model
{
    protected $table = 'artisan_ui_logs';

    protected $fillable = [
        'command',
        'parameters',
        'status',
        'output',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];
}

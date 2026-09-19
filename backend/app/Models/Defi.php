<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Defi extends Model
{
    protected $fillable = ['titre', 'description', 'objectif_membres', 'date_limite', 'actif'];

    protected function casts(): array
    {
        return [
            'date_limite' => 'datetime',
            'actif' => 'boolean',
        ];
    }
}

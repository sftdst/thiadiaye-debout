<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    protected $fillable = ['titre', 'contenu', 'type', 'statut', 'publie_at'];

    protected function casts(): array
    {
        return ['publie_at' => 'datetime'];
    }
}

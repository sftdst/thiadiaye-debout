<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quartier extends Model
{
    protected $fillable = [
        'nom',
        'couleur',
        'geojson',
    ];

    protected function casts(): array
    {
        return [
            'geojson' => 'array',
        ];
    }

    public function membres(): HasMany
    {
        return $this->hasMany(Membre::class);
    }
}

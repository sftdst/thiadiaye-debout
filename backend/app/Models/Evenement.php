<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evenement extends Model
{
    protected $fillable = [
        'titre', 'description', 'lieu', 'quartier_id', 'latitude', 'longitude',
        'debut_at', 'lien_reunion', 'reserve_ambassadeurs',
        'rappel_j1_envoye_at', 'rappel_h1_envoye_at',
    ];

    protected function casts(): array
    {
        return [
            'debut_at' => 'datetime',
            'reserve_ambassadeurs' => 'boolean',
            'rappel_j1_envoye_at' => 'datetime',
            'rappel_h1_envoye_at' => 'datetime',
        ];
    }

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }
}

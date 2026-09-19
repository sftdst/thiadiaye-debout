<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    protected $fillable = [
        'titre', 'description', 'type', 'url', 'quartier_id', 'membre_id', 'statut',
    ];

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Realisation extends Model
{
    protected $fillable = [
        'titre', 'description', 'quartier_id', 'photo_avant_url', 'photo_apres_url', 'date_realisation',
    ];

    protected function casts(): array
    {
        return ['date_realisation' => 'date'];
    }

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }
}

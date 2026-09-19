<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveSession extends Model
{
    protected $fillable = [
        'titre', 'description', 'type', 'quartier_id', 'statut',
        'lien_stream', 'lien_replay', 'video_id', 'viewers_count',
        'planifie_at', 'demarre_at', 'termine_at',
    ];

    protected function casts(): array
    {
        return [
            'planifie_at' => 'datetime',
            'demarre_at' => 'datetime',
            'termine_at' => 'datetime',
        ];
    }

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MessageChatLive::class);
    }
}

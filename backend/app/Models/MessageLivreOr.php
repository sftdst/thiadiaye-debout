<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageLivreOr extends Model
{
    protected $table = 'messages_livre_or';

    protected $fillable = ['membre_id', 'auteur_nom', 'message', 'statut'];

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}

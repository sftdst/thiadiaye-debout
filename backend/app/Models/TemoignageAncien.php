<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemoignageAncien extends Model
{
    protected $table = 'temoignages_anciens';

    protected $fillable = ['membre_id', 'auteur_nom', 'contenu', 'statut'];

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}

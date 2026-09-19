<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Idee extends Model
{
    protected $fillable = ['membre_id', 'titre', 'description', 'statut'];

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }

    public function votants(): BelongsToMany
    {
        return $this->belongsToMany(Membre::class, 'vote_idee')->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemoignageMembre extends Model
{
    protected $table = 'temoignages_membres';

    protected $fillable = ['membre_id', 'contenu', 'statut', 'mis_en_avant_le'];

    protected function casts(): array
    {
        return ['mis_en_avant_le' => 'date'];
    }

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}

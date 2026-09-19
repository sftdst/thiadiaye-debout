<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OptionSondage extends Model
{
    protected $table = 'options_sondage';

    protected $fillable = ['sondage_id', 'texte'];

    public function sondage(): BelongsTo
    {
        return $this->belongsTo(Sondage::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}

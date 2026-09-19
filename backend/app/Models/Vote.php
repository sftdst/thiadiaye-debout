<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vote extends Model
{
    protected $fillable = ['sondage_id', 'option_sondage_id', 'membre_id'];

    public function sondage(): BelongsTo
    {
        return $this->belongsTo(Sondage::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(OptionSondage::class, 'option_sondage_id');
    }

    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class);
    }
}

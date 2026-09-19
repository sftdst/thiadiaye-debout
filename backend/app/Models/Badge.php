<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'nom',
        'ordre',
    ];

    public function membres(): BelongsToMany
    {
        return $this->belongsToMany(Membre::class, 'membre_badge')
            ->withPivot('obtenu_at');
    }
}

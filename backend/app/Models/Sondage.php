<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sondage extends Model
{
    protected $fillable = ['question', 'actif', 'expire_at'];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
            'expire_at' => 'datetime',
        ];
    }

    public function options(): HasMany
    {
        return $this->hasMany(OptionSondage::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}

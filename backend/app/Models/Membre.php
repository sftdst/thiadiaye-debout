<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Membre extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'numero_carte',
        'nom',
        'telephone',
        'photo_profil_url',
        'cni_numero',
        'cni_recto_url',
        'cni_verso_url',
        'password',
        'quartier_id',
        'parraine_par_id',
        'langue_preferee',
        'role',
        'statut',
        'date_adhesion',
        'consentement_donnees',
        'consentement_donnees_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'date_adhesion' => 'datetime',
            'consentement_donnees' => 'boolean',
            'consentement_donnees_at' => 'datetime',
        ];
    }

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'membre_badge')
            ->withPivot('obtenu_at');
    }

    public function ambassadeur(): BelongsTo
    {
        return $this->belongsTo(Membre::class, 'parraine_par_id');
    }

    public function filleuls(): HasMany
    {
        return $this->hasMany(Membre::class, 'parraine_par_id');
    }
}

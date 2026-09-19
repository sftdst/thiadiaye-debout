<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresentationMouvement extends Model
{
    protected $table = 'presentation_mouvement';

    protected $fillable = [
        'description', 'president_nom', 'president_titre', 'president_bio', 'president_photo_url',
    ];
}

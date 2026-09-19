<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Traduction extends Model
{
    protected $fillable = ['cle', 'langue', 'texte'];
}

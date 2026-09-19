<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichierAudio extends Model
{
    protected $table = 'fichiers_audio';

    protected $fillable = ['cle', 'langue', 'url'];
}

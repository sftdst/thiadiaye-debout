<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContenuFormation extends Model
{
    protected $table = 'contenus_formation';

    protected $fillable = ['titre', 'contenu', 'url', 'ordre'];
}

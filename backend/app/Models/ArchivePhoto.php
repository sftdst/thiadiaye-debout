<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArchivePhoto extends Model
{
    protected $fillable = ['titre', 'description', 'url', 'annee'];
}

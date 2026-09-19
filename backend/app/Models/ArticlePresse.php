<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticlePresse extends Model
{
    protected $table = 'articles_presse';

    protected $fillable = [
        'titre', 'source', 'lien', 'image_url', 'date_publication',
    ];

    protected function casts(): array
    {
        return ['date_publication' => 'date'];
    }
}

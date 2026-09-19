<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArticlePresse;

class ArticlePresseController extends Controller
{
    public function index()
    {
        return ArticlePresse::latest('date_publication')->get();
    }
}

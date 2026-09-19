<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PresentationMouvement;

class PresentationMouvementController extends Controller
{
    public function show()
    {
        return PresentationMouvement::firstOrCreate([]);
    }
}

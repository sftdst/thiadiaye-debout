<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quartier;

class QuartierController extends Controller
{
    /**
     * Liste publique des quartiers, avec compteur de membres.
     */
    public function index()
    {
        return Quartier::withCount('membres')
            ->orderBy('nom')
            ->get(['id', 'nom', 'couleur', 'geojson']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Realisation;
use Illuminate\Http\Request;

class RealisationController extends Controller
{
    /**
     * Réalisations documentées, utilisées par le journal (module 2) et la
     * carte interactive (module 5, filtrage par quartier).
     */
    public function index(Request $request)
    {
        $query = Realisation::with('quartier:id,nom,couleur');

        if ($quartierId = $request->query('quartier_id')) {
            $query->where('quartier_id', $quartierId);
        }

        return $query->latest('date_realisation')->get();
    }
}

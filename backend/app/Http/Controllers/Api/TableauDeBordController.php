<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membre;
use App\Models\Quartier;
use App\Models\Realisation;

class TableauDeBordController extends Controller
{
    /**
     * Tableau de bord public (module 10) — accessible sans authentification.
     */
    public function index()
    {
        $adhesionsParJour = Membre::selectRaw('DATE(date_adhesion) as jour, COUNT(*) as total')
            ->where('date_adhesion', '>=', now()->subDays(30))
            ->groupBy('jour')
            ->orderBy('jour')
            ->get();

        return [
            'total_membres' => Membre::count(),
            'total_quartiers' => Quartier::count(),
            'total_realisations' => Realisation::count(),
            'adhesions_par_jour' => $adhesionsParJour,
            'carte_chaleur_quartiers' => Quartier::withCount('membres')
                ->orderByDesc('membres_count')
                ->get(['id', 'nom', 'couleur']),
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Defi;
use App\Models\Membre;
use App\Models\Quartier;

class GamificationController extends Controller
{
    /**
     * Classement des quartiers par nombre de membres (public, temps réel).
     */
    public function classementQuartiers()
    {
        return Quartier::withCount('membres')
            ->orderByDesc('membres_count')
            ->get(['id', 'nom', 'couleur']);
    }

    /**
     * Défis collectifs actifs, avec la progression courante (nombre total
     * de membres adhérents depuis le lancement du défi).
     */
    public function defis()
    {
        $totalMembres = Membre::count();

        return Defi::where('actif', true)
            ->where('date_limite', '>=', now())
            ->get()
            ->map(fn (Defi $defi) => [
                'id' => $defi->id,
                'titre' => $defi->titre,
                'description' => $defi->description,
                'objectif_membres' => $defi->objectif_membres,
                'progression' => $totalMembres,
                'date_limite' => $defi->date_limite,
            ]);
    }
}

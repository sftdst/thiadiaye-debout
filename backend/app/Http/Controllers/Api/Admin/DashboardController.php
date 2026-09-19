<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Defi;
use App\Models\Evenement;
use App\Models\Idee;
use App\Models\Membre;
use App\Models\MessageLivreOr;
use App\Models\Publication;
use App\Models\Quartier;
use App\Models\Realisation;
use App\Models\Sondage;
use App\Models\TemoignageAncien;
use App\Models\TemoignageMembre;
use App\Models\Video;
use App\Models\Vote;

class DashboardController extends Controller
{
    /**
     * Tableau de bord interne : agrège les KPI de tous les modules pour
     * donner à l'administration une vue d'ensemble en un seul appel.
     */
    public function index()
    {
        $totalMembres = Membre::count();

        $defisActifs = Defi::where('actif', true)
            ->where('date_limite', '>=', now())
            ->get()
            ->map(fn (Defi $defi) => [
                'id' => $defi->id,
                'titre' => $defi->titre,
                'objectif_membres' => $defi->objectif_membres,
                'progression' => $totalMembres,
                'date_limite' => $defi->date_limite,
            ]);

        return [
            'kpis' => [
                'total_membres' => $totalMembres,
                'total_quartiers' => Quartier::count(),
                'total_ambassadeurs' => Membre::where('role', 'ambassadeur')->count(),
                'total_realisations' => Realisation::count(),
                'sondages_actifs' => Sondage::where('actif', true)->count(),
                'total_votes' => Vote::count(),
                'videos_publiees' => Video::where('statut', 'publiee')->count(),
                'publications_publiees' => Publication::where('statut', 'publiee')->count(),
                'evenements_a_venir' => Evenement::where('debut_at', '>=', now())->count(),
                'idees_approuvees' => Idee::where('statut', 'approuvee')->count(),
            ],

            'moderation_en_attente' => [
                'idees' => Idee::where('statut', 'en_attente')->count(),
                'videos' => Video::where('statut', 'en_attente')->count(),
                'temoignages_anciens' => TemoignageAncien::where('statut', 'en_attente')->count(),
                'temoignages_membres' => TemoignageMembre::where('statut', 'en_attente')->count(),
                'messages_livre_or' => MessageLivreOr::where('statut', 'en_attente')->count(),
            ],

            'membres_par_quartier' => Quartier::withCount('membres')
                ->orderByDesc('membres_count')
                ->get(['id', 'nom', 'couleur']),

            'badges_distribution' => Badge::withCount('membres')
                ->orderBy('ordre')
                ->get(['id', 'nom', 'ordre']),

            'adhesions_par_jour' => Membre::selectRaw('DATE(date_adhesion) as jour, COUNT(*) as total')
                ->where('date_adhesion', '>=', now()->subDays(14))
                ->groupBy('jour')
                ->orderBy('jour')
                ->get(),

            'defis_actifs' => $defisActifs,

            'evenements_a_venir' => Evenement::where('debut_at', '>=', now())
                ->withCount('inscriptions')
                ->with('quartier:id,nom,couleur')
                ->orderBy('debut_at')
                ->limit(5)
                ->get(),

            'top_ambassadeurs' => Membre::where('role', 'ambassadeur')
                ->withCount('filleuls')
                ->orderByDesc('filleuls_count')
                ->limit(5)
                ->get(['id', 'nom']),
        ];
    }
}

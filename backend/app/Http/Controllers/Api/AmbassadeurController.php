<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContenuFormation;
use App\Models\Evenement;
use App\Models\Membre;
use Illuminate\Http\Request;

class AmbassadeurController extends Controller
{
    /**
     * Espace personnel d'un ambassadeur : ses recrutements, son classement,
     * la formation, la prochaine réunion mensuelle et le lien du groupe
     * WhatsApp dédié.
     */
    public function espace(Request $request)
    {
        $membre = $request->user();

        if ($membre->role !== 'ambassadeur') {
            abort(403, 'Espace réservé aux ambassadeurs.');
        }

        $classement = Membre::where('role', 'ambassadeur')
            ->withCount('filleuls')
            ->orderByDesc('filleuls_count')
            ->get(['id', 'nom'])
            ->values();

        $prochaineReunion = Evenement::where('reserve_ambassadeurs', true)
            ->where('debut_at', '>=', now())
            ->orderBy('debut_at')
            ->first();

        return [
            'recrutements_count' => $membre->filleuls()->count(),
            'filleuls' => $membre->filleuls()->get(['id', 'nom', 'date_adhesion']),
            'classement' => $classement,
            'contenu_formation' => ContenuFormation::orderBy('ordre')->get(),
            'prochaine_reunion' => $prochaineReunion,
            'lien_groupe_whatsapp' => config('services.whatsapp.groupe_ambassadeurs_url'),
            'lien_parrainage' => config('app.frontend_web_url')."/adhesion?parrain={$membre->numero_carte}",
        ];
    }

    /**
     * Classement public des ambassadeurs (transparence / émulation, module 1).
     */
    public function classement()
    {
        return Membre::where('role', 'ambassadeur')
            ->withCount('filleuls')
            ->orderByDesc('filleuls_count')
            ->limit(10)
            ->get(['id', 'nom', 'quartier_id']);
    }
}

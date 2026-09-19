<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    /**
     * Agenda public — événements à venir, hors réunions réservées aux
     * ambassadeurs.
     */
    public function index()
    {
        return Evenement::where('reserve_ambassadeurs', false)
            ->where('debut_at', '>=', now())
            ->withCount('inscriptions')
            ->with('quartier:id,nom,couleur')
            ->orderBy('debut_at')
            ->get();
    }

    public function show(Evenement $evenement)
    {
        if ($evenement->reserve_ambassadeurs) {
            abort(404);
        }

        return $evenement->loadCount('inscriptions')->load('quartier:id,nom,couleur');
    }

    public function inscrire(Request $request, Evenement $evenement)
    {
        $membre = $request->user();

        if ($evenement->inscriptions()->where('membre_id', $membre->id)->exists()) {
            abort(409, 'Vous êtes déjà inscrit à cet événement.');
        }

        $evenement->inscriptions()->create(['membre_id' => $membre->id]);

        return $evenement->loadCount('inscriptions');
    }
}

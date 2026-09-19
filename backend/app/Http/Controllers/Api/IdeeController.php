<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Idee;
use Illuminate\Http\Request;

class IdeeController extends Controller
{
    /**
     * Boîte à idées publique : uniquement les idées approuvées (modération,
     * cf. section 6.3 de la spec technique).
     */
    public function index()
    {
        return Idee::where('statut', 'approuvee')
            ->withCount('votants')
            ->with('membre:id,nom')
            ->latest()
            ->get();
    }

    /**
     * Un membre soumet une idée — passe par la file de modération avant
     * publication.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
        ]);

        $idee = Idee::create([
            ...$data,
            'membre_id' => $request->user()->id,
            'statut' => 'en_attente',
        ]);

        return response()->json($idee, 201);
    }

    /**
     * Vote d'un membre pour une idée déjà approuvée.
     */
    public function vote(Request $request, Idee $idee)
    {
        if ($idee->statut !== 'approuvee') {
            abort(422, "Cette idée n'est pas ouverte au vote.");
        }

        if ($idee->votants()->where('membre_id', $request->user()->id)->exists()) {
            abort(409, 'Vous avez déjà voté pour cette idée.');
        }

        $idee->votants()->attach($request->user()->id);

        return $idee->loadCount('votants');
    }
}

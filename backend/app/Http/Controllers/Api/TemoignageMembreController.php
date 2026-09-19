<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TemoignageMembre;
use Illuminate\Http\Request;

class TemoignageMembreController extends Controller
{
    /**
     * "Témoignage de la semaine" — le dernier mis en avant par l'admin.
     */
    public function index()
    {
        return TemoignageMembre::where('statut', 'publie')
            ->with('membre:id,nom,quartier_id')
            ->orderByDesc('mis_en_avant_le')
            ->limit(5)
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'contenu' => ['required', 'string', 'max:2000'],
        ]);

        $temoignage = TemoignageMembre::create([
            'membre_id' => $request->user()->id,
            'contenu' => $data['contenu'],
            'statut' => 'en_attente',
        ]);

        return response()->json($temoignage, 201);
    }
}

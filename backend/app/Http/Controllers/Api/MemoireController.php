<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchivePhoto;
use App\Models\MessageLivreOr;
use App\Models\TemoignageAncien;
use Illuminate\Http\Request;

class MemoireController extends Controller
{
    public function photos()
    {
        return ArchivePhoto::orderByDesc('annee')->get();
    }

    public function temoignages()
    {
        return TemoignageAncien::where('statut', 'publie')->latest()->get();
    }

    /**
     * Un membre soumet un témoignage sur l'histoire de Thiadiaye —
     * passe par la modération avant publication (section 6.3).
     */
    public function storeTemoignage(Request $request)
    {
        $data = $request->validate([
            'contenu' => ['required', 'string', 'max:3000'],
        ]);

        $temoignage = TemoignageAncien::create([
            'membre_id' => $request->user()->id,
            'auteur_nom' => $request->user()->nom,
            'contenu' => $data['contenu'],
            'statut' => 'en_attente',
        ]);

        return response()->json($temoignage, 201);
    }

    public function livreOr()
    {
        return MessageLivreOr::where('statut', 'publie')->latest()->get();
    }

    public function storeLivreOr(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $message = MessageLivreOr::create([
            'membre_id' => $request->user()->id,
            'auteur_nom' => $request->user()->nom,
            'message' => $data['message'],
            'statut' => 'en_attente',
        ]);

        return response()->json($message, 201);
    }
}

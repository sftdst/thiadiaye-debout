<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FichierAudio;
use Illuminate\Http\Request;

class FichierAudioAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = FichierAudio::query();

        if ($langue = $request->query('langue')) {
            $query->where('langue', $langue);
        }

        return $query->orderBy('cle')->get();
    }

    /**
     * Enregistre le lien vers un message vocal pré-enregistré par un
     * locuteur natif (pas de synthèse vocale automatique — cf. spec 5.4).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'cle' => ['required', 'string', 'max:255'],
            'langue' => ['required', 'string', 'in:wo,srr'],
            'url' => ['required', 'url'],
        ]);

        $fichier = FichierAudio::updateOrCreate(
            ['cle' => $data['cle'], 'langue' => $data['langue']],
            ['url' => $data['url']]
        );

        return response()->json($fichier, 201);
    }

    public function destroy(FichierAudio $fichierAudio)
    {
        $fichierAudio->delete();

        return response()->noContent();
    }
}

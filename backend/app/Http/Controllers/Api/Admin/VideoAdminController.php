<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoAdminController extends Controller
{
    /**
     * Liste complète (y compris en attente de modération), pour le back-office.
     */
    public function index(Request $request)
    {
        $query = Video::with('quartier:id,nom,couleur', 'membre:id,nom');

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest()->paginate(20);
    }

    /**
     * Ajout d'une vidéo par l'administration (URL externe ou déjà hébergée —
     * l'intégration d'un stockage S3-compatible reste à faire, cf. Étape 0).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', 'in:message,temoignage,realisation,replay'],
            'url' => ['required', 'url', 'max:2048'],
            'quartier_id' => ['nullable', 'exists:quartiers,id'],
        ]);

        $video = Video::create([...$data, 'statut' => 'publiee']);

        return response()->json($video, 201);
    }

    /**
     * Modification complète d'une vidéo (titre, description, type, url, quartier).
     */
    public function update(Request $request, Video $video)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['sometimes', 'in:message,temoignage,realisation,replay'],
            'url' => ['sometimes', 'url', 'max:2048'],
            'quartier_id' => ['nullable', 'exists:quartiers,id'],
        ]);

        $video->update($data);

        return $video;
    }

    public function updateStatut(Request $request, Video $video)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:publiee,rejetee'],
        ]);

        $video->update($data);

        return $video;
    }

    public function destroy(Video $video)
    {
        $video->delete();

        return response()->noContent();
    }
}

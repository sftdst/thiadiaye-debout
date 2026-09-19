<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Models\Video;
use Illuminate\Http\Request;

class LiveAdminController extends Controller
{
    public function index()
    {
        return LiveSession::with('quartier:id,nom,couleur')
            ->orderByDesc('planifie_at')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:maire,quartier'],
            'quartier_id' => ['nullable', 'exists:quartiers,id'],
            'lien_stream' => ['nullable', 'url'],
            'planifie_at' => ['required', 'date'],
        ]);

        return response()->json(LiveSession::create($data), 201);
    }

    public function update(Request $request, LiveSession $live)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', 'in:maire,quartier'],
            'quartier_id' => ['nullable', 'exists:quartiers,id'],
            'lien_stream' => ['nullable', 'url'],
            'planifie_at' => ['sometimes', 'date'],
        ]);

        $live->update($data);

        return $live;
    }

    /**
     * Démarre le live : bascule le statut et affiche l'indicateur LIVE.
     */
    public function demarrer(LiveSession $live)
    {
        if ($live->statut !== 'planifie') {
            abort(422, 'Seul un live planifié peut être démarré.');
        }

        $live->update(['statut' => 'en_cours', 'demarre_at' => now(), 'viewers_count' => 0]);

        return $live;
    }

    /**
     * Termine le live et enregistre le replay dans l'espace vidéo
     * (module 4) si un lien de replay est fourni.
     */
    public function terminer(Request $request, LiveSession $live)
    {
        if ($live->statut !== 'en_cours') {
            abort(422, "Ce live n'est pas en cours.");
        }

        $data = $request->validate([
            'lien_replay' => ['nullable', 'url'],
        ]);

        $video = null;
        if (! empty($data['lien_replay'])) {
            $video = Video::create([
                'titre' => 'Replay — '.$live->titre,
                'type' => 'replay',
                'url' => $data['lien_replay'],
                'quartier_id' => $live->quartier_id,
                'statut' => 'publiee',
            ]);
        }

        $live->update([
            'statut' => 'termine',
            'termine_at' => now(),
            'lien_replay' => $data['lien_replay'] ?? null,
            'video_id' => $video?->id,
        ]);

        return $live->load('video');
    }

    public function destroy(LiveSession $live)
    {
        $live->delete();

        return response()->noContent();
    }
}

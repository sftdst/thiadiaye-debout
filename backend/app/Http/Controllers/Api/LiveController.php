<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use Illuminate\Http\Request;

class LiveController extends Controller
{
    /**
     * Live en cours (s'il y en a un) + lives planifiés à venir + derniers
     * replays. Utilisé pour l'indicateur LIVE sur l'accueil.
     */
    public function index()
    {
        return [
            'en_cours' => LiveSession::where('statut', 'en_cours')
                ->with('quartier:id,nom,couleur')
                ->get(),
            'planifies' => LiveSession::where('statut', 'planifie')
                ->where('planifie_at', '>=', now())
                ->with('quartier:id,nom,couleur')
                ->orderBy('planifie_at')
                ->get(),
            'replays' => LiveSession::where('statut', 'termine')
                ->whereNotNull('lien_replay')
                ->with('quartier:id,nom,couleur')
                ->orderByDesc('termine_at')
                ->limit(10)
                ->get(),
        ];
    }

    public function show(LiveSession $live)
    {
        return $live->load('quartier:id,nom,couleur');
    }

    /**
     * Heartbeat appelé périodiquement par le lecteur pendant qu'un
     * spectateur regarde — approxime un compteur de viewers sans
     * infrastructure WebSocket (cf. Étape 0).
     */
    public function join(LiveSession $live)
    {
        if ($live->statut !== 'en_cours') {
            abort(422, "Ce live n'est pas en cours.");
        }

        $live->increment('viewers_count');

        return ['viewers_count' => $live->fresh()->viewers_count];
    }

    public function leave(LiveSession $live)
    {
        if ($live->viewers_count > 0) {
            $live->decrement('viewers_count');
        }

        return ['viewers_count' => $live->fresh()->viewers_count];
    }

    /**
     * Récupère les messages du chat live, en polling (?apres=<id>).
     */
    public function chat(Request $request, LiveSession $live)
    {
        $query = $live->messages()->with('membre:id,nom')->orderBy('id');

        if ($apres = $request->query('apres')) {
            $query->where('id', '>', $apres);
        } else {
            $query->latest('id')->limit(50);
        }

        return $query->get()->sortBy('id')->values();
    }

    public function postChat(Request $request, LiveSession $live)
    {
        if ($live->statut !== 'en_cours') {
            abort(422, "Ce live n'est pas en cours.");
        }

        $data = $request->validate([
            'contenu' => ['required', 'string', 'max:500'],
        ]);

        $message = $live->messages()->create([
            'membre_id' => $request->user()->id,
            'contenu' => $data['contenu'],
        ]);

        return response()->json($message->load('membre:id,nom'), 201);
    }
}

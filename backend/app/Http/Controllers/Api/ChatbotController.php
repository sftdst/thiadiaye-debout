<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membre;
use App\Models\MessageEchange;
use App\Models\SessionChatbot;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    /**
     * Point d'entrée générique du chatbot WhatsApp.
     *
     * NOTE IMPORTANTE : tant que le fournisseur WhatsApp Business API (BSP
     * ou Meta Cloud API — cf. Étape 0 du suivi projet) n'est pas choisi, ce
     * endpoint ne peut pas être branché à un vrai numéro WhatsApp. Il attend
     * un payload générique {telephone, message} et renvoie la réponse à
     * envoyer ; le mapping exact du payload entrant/sortant du BSP retenu
     * sera à adapter ici une fois le choix fait.
     *
     * La signature du webhook est vérifiée via un secret partagé
     * (WHATSAPP_WEBHOOK_SECRET) envoyé dans l'en-tête X-Webhook-Signature,
     * en HMAC SHA-256 du corps brut de la requête — à remplacer par le
     * mécanisme de signature propre au BSP choisi.
     */
    public function webhook(Request $request)
    {
        $this->verifySignature($request);

        $data = $request->validate([
            'telephone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $session = SessionChatbot::firstOrCreate(
            ['telephone' => $data['telephone']],
            ['membre_id' => Membre::where('telephone', $data['telephone'])->value('id')]
        );

        $session->messages()->create([
            'direction' => 'entrant',
            'contenu' => $data['message'],
        ]);

        $reponse = $this->repondre($data['message'], $session);

        $session->messages()->create([
            'direction' => 'sortant',
            'contenu' => $reponse,
        ]);

        return ['reponse' => $reponse];
    }

    private function verifySignature(Request $request): void
    {
        $secret = config('services.whatsapp.webhook_secret');
        if (! $secret) {
            // Pas encore de BSP configuré (Étape 0) — vérification désactivée en local.
            return;
        }

        $signature = $request->header('X-Webhook-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($expected, $signature)) {
            abort(401, 'Signature de webhook invalide.');
        }
    }

    private function repondre(string $message, SessionChatbot $session): string
    {
        $texte = mb_strtolower(trim($message));
        $membre = $session->membre;

        if (str_contains($texte, 'adhe')) {
            $lienAdhesion = config('app.frontend_web_url').'/adhesion';

            return "Rejoignez le mouvement Thiadiaye Debout ! Adhérez ici : {$lienAdhesion}";
        }

        if (str_contains($texte, 'carte')) {
            if (! $membre) {
                return "Vous n'êtes pas encore membre. Envoyez ADHESION pour rejoindre le mouvement.";
            }

            return "Voici votre carte de membre : {$membre->numero_carte} — {$membre->nom}, {$membre->quartier?->nom}.";
        }

        if (str_contains($texte, 'ambassadeur')) {
            if (! $membre) {
                return "Envoyez ADHESION pour rejoindre le mouvement et être mis en relation avec votre ambassadeur de quartier.";
            }

            $ambassadeur = Membre::where('quartier_id', $membre->quartier_id)
                ->where('role', 'ambassadeur')
                ->first();

            return $ambassadeur
                ? "L'ambassadeur de votre quartier ({$membre->quartier?->nom}) est {$ambassadeur->nom} — {$ambassadeur->telephone}."
                : "Aucun ambassadeur n'est encore désigné pour votre quartier.";
        }

        return "Bienvenue sur le chatbot Thiadiaye Debout ! Tapez :\n".
            "- ADHESION pour rejoindre le mouvement\n".
            "- CARTE pour recevoir votre carte de membre\n".
            "- AMBASSADEUR pour contacter l'ambassadeur de votre quartier\n".
            '(Actualités et agenda arrivent avec les prochains modules.)';
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Evenement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class EnvoyerRappelsEvenements extends Command
{
    protected $signature = 'evenements:envoyer-rappels';

    protected $description = "Envoie les rappels J-1 et H-1 pour les événements de l'agenda citoyen (module 7)";

    /**
     * NOTE : l'envoi effectif via WhatsApp dépend du choix du fournisseur
     * BSP (Étape 0 du suivi projet). Pour l'instant, cette commande
     * identifie les événements à notifier, marque le rappel comme envoyé,
     * et journalise le message qui serait envoyé — à brancher sur le
     * service d'envoi WhatsApp une fois le BSP choisi.
     */
    public function handle(): int
    {
        $this->envoyerPourFenetre(
            debutDans: [23, 25],
            colonne: 'rappel_j1_envoye_at',
            libelle: 'J-1'
        );

        $this->envoyerPourFenetre(
            debutDans: [0.5, 1.5],
            colonne: 'rappel_h1_envoye_at',
            libelle: 'H-1'
        );

        return self::SUCCESS;
    }

    private function envoyerPourFenetre(array $debutDans, string $colonne, string $libelle): void
    {
        [$min, $max] = $debutDans;

        $evenements = Evenement::whereNull($colonne)
            ->whereBetween('debut_at', [now()->addHours($min), now()->addHours($max)])
            ->get();

        foreach ($evenements as $evenement) {
            $inscrits = $evenement->inscriptions()->with('membre:id,telephone,nom')->get();

            foreach ($inscrits as $inscription) {
                Log::info("[Rappel {$libelle}] À envoyer à {$inscription->membre->telephone}", [
                    'evenement' => $evenement->titre,
                    'debut_at' => $evenement->debut_at,
                ]);
            }

            $evenement->update([$colonne => now()]);
            $this->info("Rappel {$libelle} traité pour « {$evenement->titre} » ({$inscrits->count()} inscrit(s)).");
        }
    }
}

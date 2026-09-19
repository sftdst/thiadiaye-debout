<?php

namespace Database\Seeders;

use App\Models\Traduction;
use Illuminate\Database\Seeder;

class DemoTraductionsSeeder extends Seeder
{
    /**
     * Quelques traductions wolof de démonstration — volontairement limitées
     * à des expressions très courantes et non ambiguës, pour montrer le
     * mécanisme sans se substituer à un vrai travail de traduction par un
     * locuteur natif (cf. SUIVI_PROJET.md, Étape 7). Aucune traduction
     * sérère n'est fournie ici pour la même raison — à saisir avec l'aide
     * d'un locuteur natif sérère.
     */
    public function run(): void
    {
        $traductions = [
            ['cle' => 'accueil.bienvenue', 'texte' => 'Dalal ak diam ci Thiadiaye Debout'],
            ['cle' => 'accueil.cta_adhesion', 'texte' => 'Bokk ci mouvement bi'],
            ['cle' => 'commun.merci', 'texte' => 'Jërejëf'],
        ];

        foreach ($traductions as $t) {
            Traduction::updateOrCreate(
                ['cle' => $t['cle'], 'langue' => 'wo'],
                ['texte' => $t['texte']]
            );
        }
    }
}

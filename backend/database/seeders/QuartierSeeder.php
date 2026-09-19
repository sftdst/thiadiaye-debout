<?php

namespace Database\Seeders;

use App\Models\Quartier;
use Illuminate\Database\Seeder;

class QuartierSeeder extends Seeder
{
    /**
     * Quartiers de démonstration — liste PROVISOIRE en attendant la
     * validation officielle avec la mairie (Étape 0 du suivi projet).
     */
    public function run(): void
    {
        $quartiers = [
            ['nom' => 'Quartier Centre', 'couleur' => '#027EED'],
            ['nom' => 'Quartier Nord', 'couleur' => '#0ECEF7'],
            ['nom' => 'Quartier Sud', 'couleur' => '#F7B506'],
            ['nom' => 'Quartier Est', 'couleur' => '#0246B0'],
            ['nom' => 'Quartier Ouest', 'couleur' => '#01196D'],
        ];

        foreach ($quartiers as $quartier) {
            Quartier::updateOrCreate(['nom' => $quartier['nom']], $quartier);
        }
    }
}

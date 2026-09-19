<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    /**
     * Paliers de progression décrits en section 3 de la spec technique.
     */
    public function run(): void
    {
        $badges = [
            ['nom' => 'Nouveau membre', 'ordre' => 1],
            ['nom' => 'Actif', 'ordre' => 2],
            ['nom' => 'Ambassadeur', 'ordre' => 3],
            ['nom' => 'Pilier de Thiadiaye', 'ordre' => 4],
        ];

        foreach ($badges as $badge) {
            Badge::firstOrCreate(['nom' => $badge['nom']], $badge);
        }
    }
}

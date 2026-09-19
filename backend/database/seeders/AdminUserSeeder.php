<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Compte administrateur de développement. À changer avant toute mise
     * en production — ces identifiants ne doivent jamais être utilisés
     * hors environnement local.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@thiadiaye-debout.local'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'administrateur',
            ]
        );
    }
}

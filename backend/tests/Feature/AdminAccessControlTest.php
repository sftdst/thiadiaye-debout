<?php

namespace Tests\Feature;

use App\Models\Membre;
use App\Models\Quartier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_membre_ne_peut_pas_acceder_aux_routes_admin(): void
    {
        $quartier = Quartier::create(['nom' => 'Quartier Centre', 'couleur' => '#027EED']);
        $membre = Membre::create([
            'numero_carte' => 'TD-000001',
            'nom' => 'Awa Diop',
            'telephone' => '770000001',
            'quartier_id' => $quartier->id,
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);
        $token = $membre->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/membres')
            ->assertForbidden();
    }

    public function test_un_administrateur_peut_acceder_aux_routes_admin(): void
    {
        $user = User::create([
            'name' => 'Admin',
            'email' => 'admin@thiadiaye-debout.local',
            'password' => Hash::make('password'),
            'role' => 'administrateur',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/membres')
            ->assertOk();
    }

    public function test_une_requete_non_authentifiee_est_rejetee(): void
    {
        $this->getJson('/api/admin/membres')->assertUnauthorized();
    }
}

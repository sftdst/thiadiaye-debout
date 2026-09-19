<?php

namespace Tests\Feature;

use App\Models\Membre;
use App\Models\Quartier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_membre_peut_se_connecter_avec_telephone_et_mot_de_passe(): void
    {
        $quartier = Quartier::create(['nom' => 'Quartier Centre', 'couleur' => '#027EED']);
        Membre::create([
            'numero_carte' => 'TD-000001',
            'nom' => 'Awa Diop',
            'telephone' => '770000001',
            'password' => 'secret123',
            'quartier_id' => $quartier->id,
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);

        $this->postJson('/api/auth/membre/login', [
            'telephone' => '770000001',
            'password' => 'secret123',
        ])->assertOk()->assertJsonStructure(['membre', 'token']);

        $this->postJson('/api/auth/membre/login', [
            'telephone' => '770000001',
            'password' => 'mauvais-mot-de-passe',
        ])->assertUnprocessable();
    }

    public function test_un_membre_en_attente_de_validation_ne_peut_pas_se_connecter(): void
    {
        $quartier = Quartier::create(['nom' => 'Quartier Centre', 'couleur' => '#027EED']);
        $membre = Membre::create([
            'numero_carte' => 'TD-000002',
            'nom' => 'Nouveau Membre',
            'telephone' => '770000002',
            'password' => 'secret123',
            'quartier_id' => $quartier->id,
            'statut' => 'en_attente',
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);

        $this->postJson('/api/auth/membre/login', [
            'telephone' => '770000002',
            'password' => 'secret123',
        ])->assertUnprocessable()->assertJsonValidationErrors('telephone');

        $membre->update(['statut' => 'approuve']);

        $this->postJson('/api/auth/membre/login', [
            'telephone' => '770000002',
            'password' => 'secret123',
        ])->assertOk()->assertJsonStructure(['membre', 'token']);
    }

    public function test_le_personnel_peut_se_connecter_avec_email_et_mot_de_passe(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@thiadiaye-debout.local',
            'password' => Hash::make('password'),
            'role' => 'administrateur',
        ]);

        $this->postJson('/api/auth/staff/login', [
            'email' => 'admin@thiadiaye-debout.local',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_slash_me_resout_membre_pour_un_token_membre(): void
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

        $membreToken = $membre->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$membreToken}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('type', 'membre');
    }

    public function test_slash_me_resout_staff_pour_un_token_staff(): void
    {
        $user = User::create([
            'name' => 'Admin',
            'email' => 'admin@thiadiaye-debout.local',
            'password' => Hash::make('password'),
            'role' => 'administrateur',
        ]);

        $staffToken = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$staffToken}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('type', 'staff');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\Membre;
use App\Models\Quartier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdhesionTest extends TestCase
{
    use RefreshDatabase;

    private Quartier $quartier;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->quartier = Quartier::create(['nom' => 'Quartier Centre', 'couleur' => '#027EED']);
        Badge::create(['nom' => 'Nouveau membre', 'ordre' => 1]);
        Badge::create(['nom' => 'Actif', 'ordre' => 2]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nom' => 'Awa Diop',
            'telephone' => '770000001',
            'quartier_id' => $this->quartier->id,
            'consentement_donnees' => true,
            'cni_numero' => '1234567890123',
            'photo_profil' => UploadedFile::fake()->image('profil.jpg'),
            'cni_recto' => UploadedFile::fake()->image('recto.jpg'),
            'cni_verso' => UploadedFile::fake()->image('verso.jpg'),
        ], $overrides);
    }

    private function postAdhesion(array $payload)
    {
        // Le multipart/form-data (upload de fichiers) exige postJson-like
        // headers explicites pour obtenir une réponse JSON (422) plutôt
        // qu'une redirection (302) en cas d'échec de validation.
        return $this->post('/api/adhesion', $payload, ['Accept' => 'application/json']);
    }

    public function test_un_visiteur_peut_adherer_et_recoit_une_carte_et_un_badge_mais_reste_en_attente(): void
    {
        $response = $this->postAdhesion($this->payload());

        $response->assertCreated()
            ->assertJsonPath('membre.nom', 'Awa Diop')
            ->assertJsonPath('membre.statut', 'en_attente')
            ->assertJsonPath('membre.badges.0.nom', 'Nouveau membre')
            ->assertJsonStructure(['membre' => ['numero_carte', 'photo_profil_url', 'cni_recto_url', 'cni_verso_url']])
            ->assertJsonMissing(['token']);

        $membre = Membre::first();
        $this->assertSame('TD-'.str_pad((string) $membre->id, 6, '0', STR_PAD_LEFT), $membre->numero_carte);
        $this->assertTrue($membre->consentement_donnees);
        $this->assertSame('en_attente', $membre->statut);
    }

    public function test_le_telephone_doit_etre_unique(): void
    {
        Membre::create([
            'numero_carte' => 'TD-000001',
            'nom' => 'Premier',
            'telephone' => '770000001',
            'quartier_id' => $this->quartier->id,
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);

        $response = $this->postAdhesion($this->payload(['telephone' => '770000001']));

        $response->assertUnprocessable()->assertJsonValidationErrors('telephone');
    }

    public function test_le_consentement_est_obligatoire(): void
    {
        $response = $this->postAdhesion($this->payload([
            'telephone' => '770000002',
            'consentement_donnees' => false,
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors('consentement_donnees');
    }

    public function test_la_piece_didentite_est_obligatoire(): void
    {
        $payload = $this->payload(['telephone' => '770000004']);
        unset($payload['cni_recto']);

        $response = $this->postAdhesion($payload);

        $response->assertUnprocessable()->assertJsonValidationErrors('cni_recto');
    }

    public function test_le_code_parrain_relie_le_nouveau_membre_a_lambassadeur(): void
    {
        $ambassadeur = Membre::create([
            'numero_carte' => 'TD-000001',
            'nom' => 'Ambassadeur',
            'telephone' => '770000009',
            'quartier_id' => $this->quartier->id,
            'role' => 'ambassadeur',
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);

        $response = $this->postAdhesion($this->payload([
            'telephone' => '770000003',
            'code_parrain' => $ambassadeur->numero_carte,
        ]));

        $response->assertCreated();
        $this->assertSame($ambassadeur->id, Membre::where('telephone', '770000003')->value('parraine_par_id'));
    }
}

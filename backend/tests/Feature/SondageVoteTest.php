<?php

namespace Tests\Feature;

use App\Models\Membre;
use App\Models\Quartier;
use App\Models\Sondage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SondageVoteTest extends TestCase
{
    use RefreshDatabase;

    private Membre $membre;
    private string $token;
    private Sondage $sondage;
    private int $optionOuiId;
    private int $optionNonId;

    protected function setUp(): void
    {
        parent::setUp();

        $quartier = Quartier::create(['nom' => 'Quartier Centre', 'couleur' => '#027EED']);
        $this->membre = Membre::create([
            'numero_carte' => 'TD-000001',
            'nom' => 'Awa Diop',
            'telephone' => '770000001',
            'quartier_id' => $quartier->id,
            'date_adhesion' => now(),
            'consentement_donnees' => true,
            'consentement_donnees_at' => now(),
        ]);
        $this->token = $this->membre->createToken('test')->plainTextToken;

        $this->sondage = Sondage::create(['question' => 'Faut-il refaire la route ?', 'actif' => true]);
        $this->optionOuiId = $this->sondage->options()->create(['texte' => 'Oui'])->id;
        $this->optionNonId = $this->sondage->options()->create(['texte' => 'Non'])->id;
    }

    public function test_un_membre_peut_voter_une_seule_fois(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/sondages/{$this->sondage->id}/vote", ['option_sondage_id' => $this->optionOuiId])
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/sondages/{$this->sondage->id}/vote", ['option_sondage_id' => $this->optionNonId])
            ->assertStatus(409);

        $this->assertSame(1, $this->sondage->votes()->count());
    }

    public function test_une_option_dun_autre_sondage_est_rejetee(): void
    {
        $autreSondage = Sondage::create(['question' => 'Autre question ?', 'actif' => true]);
        $autreOption = $autreSondage->options()->create(['texte' => 'Peut-être'])->id;

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/sondages/{$this->sondage->id}/vote", ['option_sondage_id' => $autreOption])
            ->assertStatus(422);
    }

    public function test_un_visiteur_non_membre_ne_peut_pas_voter(): void
    {
        $this->postJson("/api/sondages/{$this->sondage->id}/vote", ['option_sondage_id' => $this->optionOuiId])
            ->assertUnauthorized();
    }
}

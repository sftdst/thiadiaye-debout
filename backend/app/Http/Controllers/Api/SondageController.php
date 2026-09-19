<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OptionSondage;
use App\Models\Sondage;
use Illuminate\Http\Request;

class SondageController extends Controller
{
    /**
     * Sondages actifs avec le décompte des votes par option (visible de tous).
     */
    public function index()
    {
        return Sondage::where('actif', true)
            ->with(['options' => fn ($q) => $q->withCount('votes')])
            ->latest()
            ->get();
    }

    /**
     * Vote d'un membre sur une option d'un sondage — un seul vote par sondage.
     */
    public function vote(Request $request, Sondage $sondage)
    {
        if (! $sondage->actif) {
            abort(422, 'Ce sondage est clôturé.');
        }

        $data = $request->validate([
            'option_sondage_id' => ['required', 'exists:options_sondage,id'],
        ]);

        $option = OptionSondage::findOrFail($data['option_sondage_id']);
        if ($option->sondage_id !== $sondage->id) {
            abort(422, "Cette option n'appartient pas à ce sondage.");
        }

        $vote = $sondage->votes()->where('membre_id', $request->user()->id)->first();
        if ($vote) {
            abort(409, 'Vous avez déjà voté pour ce sondage.');
        }

        $sondage->votes()->create([
            'option_sondage_id' => $option->id,
            'membre_id' => $request->user()->id,
        ]);

        return $sondage->load(['options' => fn ($q) => $q->withCount('votes')]);
    }
}

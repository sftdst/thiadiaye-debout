<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TemoignageMembre;
use Illuminate\Http\Request;

class TemoignageMembreAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = TemoignageMembre::with('membre:id,nom');

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest()->paginate(20);
    }

    /**
     * Approuve/rejette, et peut mettre en avant comme "témoignage de la
     * semaine" (mis_en_avant_le = aujourd'hui).
     */
    public function update(Request $request, TemoignageMembre $temoignageMembre)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:publie,rejete'],
            'mettre_en_avant' => ['sometimes', 'boolean'],
        ]);

        $temoignageMembre->update([
            'statut' => $data['statut'],
            'mis_en_avant_le' => ! empty($data['mettre_en_avant']) ? now()->toDateString() : $temoignageMembre->mis_en_avant_le,
        ]);

        return $temoignageMembre;
    }
}

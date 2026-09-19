<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Idee;
use Illuminate\Http\Request;

class IdeeAdminController extends Controller
{
    /**
     * Liste de modération — toutes les idées, filtrables par statut.
     */
    public function index(Request $request)
    {
        $query = Idee::query()->with('membre:id,nom')->withCount('votants');

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest()->paginate(20);
    }

    /**
     * Approuve ou rejette une idée soumise par un membre.
     */
    public function updateStatut(Request $request, Idee $idee)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:approuvee,rejetee'],
        ]);

        $idee->update($data);

        return $idee;
    }
}

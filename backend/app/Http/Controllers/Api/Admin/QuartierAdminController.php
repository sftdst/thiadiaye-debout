<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quartier;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class QuartierAdminController extends Controller
{
    public function index()
    {
        return Quartier::withCount('membres')->orderBy('nom')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255', 'unique:quartiers,nom'],
            'couleur' => ['required', 'string', 'max:7'],
            'geojson' => ['nullable', 'array'],
        ]);

        return response()->json(Quartier::create($data), 201);
    }

    public function update(Request $request, Quartier $quartier)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255', 'unique:quartiers,nom,'.$quartier->id],
            'couleur' => ['required', 'string', 'max:7'],
            'geojson' => ['nullable', 'array'],
        ]);

        $quartier->update($data);

        return $quartier;
    }

    public function destroy(Quartier $quartier)
    {
        try {
            $quartier->delete();
        } catch (QueryException) {
            abort(409, 'Impossible de supprimer un quartier auquel des membres sont rattachés.');
        }

        return response()->noContent();
    }
}

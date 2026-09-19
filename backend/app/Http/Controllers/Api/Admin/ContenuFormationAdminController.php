<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContenuFormation;
use Illuminate\Http\Request;

class ContenuFormationAdminController extends Controller
{
    public function index()
    {
        return ContenuFormation::orderBy('ordre')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'contenu' => ['nullable', 'string'],
            'url' => ['nullable', 'url'],
            'ordre' => ['sometimes', 'integer', 'min:0'],
        ]);

        return response()->json(ContenuFormation::create($data), 201);
    }

    public function update(Request $request, ContenuFormation $contenuFormation)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'contenu' => ['nullable', 'string'],
            'url' => ['nullable', 'url'],
            'ordre' => ['sometimes', 'integer', 'min:0'],
        ]);

        $contenuFormation->update($data);

        return $contenuFormation;
    }

    public function destroy(ContenuFormation $contenuFormation)
    {
        $contenuFormation->delete();

        return response()->noContent();
    }
}

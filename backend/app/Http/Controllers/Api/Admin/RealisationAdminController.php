<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Realisation;
use Illuminate\Http\Request;

class RealisationAdminController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quartier_id' => ['required', 'exists:quartiers,id'],
            'photo_avant_url' => ['nullable', 'url'],
            'photo_apres_url' => ['nullable', 'url'],
            'date_realisation' => ['nullable', 'date'],
        ]);

        return response()->json(Realisation::create($data), 201);
    }

    public function update(Request $request, Realisation $realisation)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quartier_id' => ['sometimes', 'exists:quartiers,id'],
            'photo_avant_url' => ['nullable', 'url'],
            'photo_apres_url' => ['nullable', 'url'],
            'date_realisation' => ['nullable', 'date'],
        ]);

        $realisation->update($data);

        return $realisation;
    }

    public function destroy(Realisation $realisation)
    {
        $realisation->delete();

        return response()->noContent();
    }
}

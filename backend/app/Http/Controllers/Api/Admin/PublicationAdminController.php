<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\Request;

class PublicationAdminController extends Controller
{
    public function index()
    {
        return Publication::latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'contenu' => ['required', 'string'],
            'type' => ['required', 'in:actualite,bilan'],
            'statut' => ['sometimes', 'in:brouillon,publiee'],
        ]);

        $data['publie_at'] = ($data['statut'] ?? 'brouillon') === 'publiee' ? now() : null;

        return response()->json(Publication::create($data), 201);
    }

    public function update(Request $request, Publication $publication)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'contenu' => ['sometimes', 'string'],
            'type' => ['sometimes', 'in:actualite,bilan'],
            'statut' => ['sometimes', 'in:brouillon,publiee'],
        ]);

        if (($data['statut'] ?? null) === 'publiee' && $publication->statut !== 'publiee') {
            $data['publie_at'] = now();
        }

        $publication->update($data);

        return $publication;
    }

    public function destroy(Publication $publication)
    {
        $publication->delete();

        return response()->noContent();
    }
}

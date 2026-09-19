<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementAdminController extends Controller
{
    public function index()
    {
        return Evenement::withCount('inscriptions')
            ->with('quartier:id,nom,couleur')
            ->orderBy('debut_at')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        return response()->json(Evenement::create($data), 201);
    }

    public function update(Request $request, Evenement $evenement)
    {
        $data = $request->validate($this->rules(sometimes: true));

        $evenement->update($data);

        return $evenement;
    }

    public function destroy(Evenement $evenement)
    {
        $evenement->delete();

        return response()->noContent();
    }

    private function rules(bool $sometimes = false): array
    {
        $req = $sometimes ? 'sometimes' : 'required';

        return [
            'titre' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lieu' => ['nullable', 'string', 'max:255'],
            'quartier_id' => ['nullable', 'exists:quartiers,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'debut_at' => [$req, 'date'],
            'lien_reunion' => ['nullable', 'url'],
            'reserve_ambassadeurs' => ['sometimes', 'boolean'],
        ];
    }
}

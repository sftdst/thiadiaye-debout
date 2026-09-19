<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Defi;
use Illuminate\Http\Request;

class DefiAdminController extends Controller
{
    public function index()
    {
        return Defi::latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'objectif_membres' => ['required', 'integer', 'min:1'],
            'date_limite' => ['required', 'date'],
        ]);

        return response()->json(Defi::create($data), 201);
    }

    public function update(Request $request, Defi $defi)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'objectif_membres' => ['sometimes', 'integer', 'min:1'],
            'date_limite' => ['sometimes', 'date'],
            'actif' => ['sometimes', 'boolean'],
        ]);

        $defi->update($data);

        return $defi;
    }

    public function destroy(Defi $defi)
    {
        $defi->delete();

        return response()->noContent();
    }
}

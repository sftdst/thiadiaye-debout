<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sondage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SondageAdminController extends Controller
{
    public function index()
    {
        return Sondage::withCount('votes')
            ->with(['options' => fn ($q) => $q->withCount('votes')])
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'expire_at' => ['nullable', 'date'],
            'options' => ['required', 'array', 'min:2'],
            'options.*' => ['required', 'string', 'max:255'],
        ]);

        $sondage = DB::transaction(function () use ($data) {
            $sondage = Sondage::create([
                'question' => $data['question'],
                'expire_at' => $data['expire_at'] ?? null,
            ]);

            $sondage->options()->createMany(
                collect($data['options'])->map(fn ($texte) => ['texte' => $texte])->all()
            );

            return $sondage;
        });

        return response()->json($sondage->load('options'), 201);
    }

    public function update(Request $request, Sondage $sondage)
    {
        $data = $request->validate([
            'question' => ['sometimes', 'string', 'max:255'],
            'actif' => ['sometimes', 'boolean'],
            'expire_at' => ['nullable', 'date'],
        ]);

        $sondage->update($data);

        return $sondage;
    }

    public function destroy(Sondage $sondage)
    {
        $sondage->delete();

        return response()->noContent();
    }
}

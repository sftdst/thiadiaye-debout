<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Traduction;
use Illuminate\Http\Request;

class TraductionAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Traduction::query();

        if ($langue = $request->query('langue')) {
            $query->where('langue', $langue);
        }

        return $query->orderBy('cle')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cle' => ['required', 'string', 'max:255'],
            'langue' => ['required', 'string', 'in:wo,srr'],
            'texte' => ['required', 'string'],
        ]);

        $traduction = Traduction::updateOrCreate(
            ['cle' => $data['cle'], 'langue' => $data['langue']],
            ['texte' => $data['texte']]
        );

        return response()->json($traduction, 201);
    }

    public function update(Request $request, Traduction $traduction)
    {
        $data = $request->validate([
            'texte' => ['required', 'string'],
        ]);

        $traduction->update($data);

        return $traduction;
    }

    public function destroy(Traduction $traduction)
    {
        $traduction->delete();

        return response()->noContent();
    }
}

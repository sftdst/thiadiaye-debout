<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArchivePhoto;
use App\Models\MessageLivreOr;
use App\Models\TemoignageAncien;
use Illuminate\Http\Request;

class MemoireAdminController extends Controller
{
    public function storePhoto(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url' => ['required', 'url', 'max:2048'],
            'annee' => ['nullable', 'integer', 'min:1900', 'max:'.date('Y')],
        ]);

        return response()->json(ArchivePhoto::create($data), 201);
    }

    public function updatePhoto(Request $request, ArchivePhoto $archivePhoto)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url' => ['sometimes', 'url', 'max:2048'],
            'annee' => ['nullable', 'integer', 'min:1900', 'max:'.date('Y')],
        ]);

        $archivePhoto->update($data);

        return $archivePhoto;
    }

    public function destroyPhoto(ArchivePhoto $archivePhoto)
    {
        $archivePhoto->delete();

        return response()->noContent();
    }

    public function temoignages(Request $request)
    {
        $query = TemoignageAncien::query();

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest()->paginate(20);
    }

    public function updateTemoignageStatut(Request $request, TemoignageAncien $temoignageAncien)
    {
        $data = $request->validate(['statut' => ['required', 'in:publie,rejete']]);
        $temoignageAncien->update($data);

        return $temoignageAncien;
    }

    public function livreOr(Request $request)
    {
        $query = MessageLivreOr::query();

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest()->paginate(20);
    }

    public function updateLivreOrStatut(Request $request, MessageLivreOr $messageLivreOr)
    {
        $data = $request->validate(['statut' => ['required', 'in:publie,rejete']]);
        $messageLivreOr->update($data);

        return $messageLivreOr;
    }
}

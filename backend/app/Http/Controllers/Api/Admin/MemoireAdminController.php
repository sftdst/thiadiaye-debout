<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArchivePhoto;
use App\Models\MessageLivreOr;
use App\Models\TemoignageAncien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemoireAdminController extends Controller
{
    public function storePhoto(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url' => ['required_without:photo', 'nullable', 'url', 'max:2048'],
            'photo' => ['required_without:url', 'nullable', 'image', 'max:5120'],
            'annee' => ['nullable', 'integer', 'min:1900', 'max:'.date('Y')],
        ]);

        if ($request->hasFile('photo')) {
            $data['url'] = Storage::disk('public')->url($request->file('photo')->store('memoire', 'public'));
        }
        unset($data['photo']);

        return response()->json(ArchivePhoto::create($data), 201);
    }

    public function updatePhoto(Request $request, ArchivePhoto $archivePhoto)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url' => ['nullable', 'url', 'max:2048'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'annee' => ['nullable', 'integer', 'min:1900', 'max:'.date('Y')],
        ]);

        if ($request->hasFile('photo')) {
            $data['url'] = Storage::disk('public')->url($request->file('photo')->store('memoire', 'public'));
        }
        unset($data['photo']);

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

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MembreAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Membre::query()->with('quartier', 'badges');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('telephone', 'like', "%{$search}%")
                    ->orWhere('numero_carte', 'like', "%{$search}%");
            });
        }

        if ($quartierId = $request->query('quartier_id')) {
            $query->where('quartier_id', $quartierId);
        }

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        return $query->latest('date_adhesion')->paginate(20);
    }

    public function show(Membre $membre)
    {
        return $membre->load('quartier', 'badges');
    }

    /**
     * Adhésion enregistrée directement par l'administration (ex : membre
     * inscrit en personne lors d'une réunion de quartier). Même logique de
     * génération de carte que l'adhésion publique (AdhesionController).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'max:30', 'unique:membres,telephone'],
            'password' => ['nullable', 'string', 'min:6'],
            'quartier_id' => ['required', 'exists:quartiers,id'],
            'langue_preferee' => ['nullable', 'string', 'in:fr,wo,srr'],
        ]);

        $membre = DB::transaction(function () use ($data) {
            $membre = Membre::create([
                'numero_carte' => 'TEMP',
                'nom' => $data['nom'],
                'telephone' => $data['telephone'],
                'password' => isset($data['password']) ? Hash::make($data['password']) : null,
                'quartier_id' => $data['quartier_id'],
                'langue_preferee' => $data['langue_preferee'] ?? 'fr',
                'date_adhesion' => now(),
                'consentement_donnees' => true,
                'consentement_donnees_at' => now(),
            ]);

            $membre->update([
                'numero_carte' => 'TD-'.str_pad((string) $membre->id, 6, '0', STR_PAD_LEFT),
            ]);

            $badgeNouveauMembre = Badge::orderBy('ordre')->first();
            if ($badgeNouveauMembre) {
                $membre->badges()->attach($badgeNouveauMembre->id, ['obtenu_at' => now()]);
            }

            return $membre;
        });

        return response()->json($membre->load('quartier', 'badges'), 201);
    }

    /**
     * Modification des informations d'un membre par l'administration.
     */
    public function update(Request $request, Membre $membre)
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'telephone' => ['sometimes', 'string', 'max:30', 'unique:membres,telephone,'.$membre->id],
            'quartier_id' => ['sometimes', 'exists:quartiers,id'],
            'langue_preferee' => ['sometimes', 'string', 'in:fr,wo,srr'],
        ]);

        $membre->update($data);

        return $membre->load('quartier', 'badges');
    }

    /**
     * Promeut ou rétrograde un membre au rôle d'ambassadeur (module 6).
     */
    public function updateRole(Request $request, Membre $membre)
    {
        $data = $request->validate([
            'role' => ['required', 'in:membre,ambassadeur'],
        ]);

        $membre->update($data);

        return $membre;
    }

    /**
     * Valide ou rejette une adhésion en attente (vérification de la pièce
     * d'identité par un administrateur). Tant que le statut n'est pas
     * "approuve", le membre ne peut pas se connecter (cf. AuthController).
     */
    public function updateStatut(Request $request, Membre $membre)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:en_attente,approuve,rejete'],
        ]);

        $membre->update($data);

        return $membre;
    }
}

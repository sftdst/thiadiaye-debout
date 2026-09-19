<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdhesionController extends Controller
{
    /**
     * Adhésion publique au mouvement : crée le membre (statut "en attente"
     * tant qu'un administrateur ne l'a pas validé — cf. pièce d'identité),
     * lui attribue le badge "Nouveau membre" et génère sa carte de membre.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'max:30', 'unique:membres,telephone'],
            'password' => ['nullable', 'string', 'min:6'],
            'quartier_id' => ['required', 'exists:quartiers,id'],
            'langue_preferee' => ['nullable', 'string', 'in:fr,wo,srr'],
            'consentement_donnees' => ['required', 'accepted'],
            'code_parrain' => ['nullable', 'string', 'max:20'],
            'photo_profil' => ['required', 'image', 'max:5120'],
            'cni_numero' => ['required', 'string', 'max:50', 'unique:membres,cni_numero'],
            'cni_recto' => ['required', 'image', 'max:5120'],
            'cni_verso' => ['required', 'image', 'max:5120'],
        ]);

        // Parrainage par un ambassadeur (module 6) — le code est le numéro
        // de carte de l'ambassadeur, partagé sur son lien d'invitation.
        $ambassadeurId = null;
        if (! empty($data['code_parrain'])) {
            $ambassadeurId = Membre::where('numero_carte', $data['code_parrain'])
                ->where('role', 'ambassadeur')
                ->value('id');
        }

        $photoProfilUrl = Storage::disk('public')->url(
            $request->file('photo_profil')->store('membres/profils', 'public')
        );
        $cniRectoUrl = Storage::disk('public')->url(
            $request->file('cni_recto')->store('membres/cni', 'public')
        );
        $cniVersoUrl = Storage::disk('public')->url(
            $request->file('cni_verso')->store('membres/cni', 'public')
        );

        $membre = DB::transaction(function () use ($data, $ambassadeurId, $photoProfilUrl, $cniRectoUrl, $cniVersoUrl) {
            $membre = Membre::create([
                'numero_carte' => 'TEMP',
                'nom' => $data['nom'],
                'telephone' => $data['telephone'],
                'photo_profil_url' => $photoProfilUrl,
                'cni_numero' => $data['cni_numero'],
                'cni_recto_url' => $cniRectoUrl,
                'cni_verso_url' => $cniVersoUrl,
                'password' => isset($data['password']) ? Hash::make($data['password']) : null,
                'quartier_id' => $data['quartier_id'],
                'parraine_par_id' => $ambassadeurId,
                'langue_preferee' => $data['langue_preferee'] ?? 'fr',
                'statut' => 'en_attente',
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

        // Pas de token : le compte est en attente de validation par un
        // administrateur, le membre ne peut pas encore se connecter.
        return response()->json([
            'membre' => $membre->load('quartier', 'badges'),
        ], 201);
    }
}

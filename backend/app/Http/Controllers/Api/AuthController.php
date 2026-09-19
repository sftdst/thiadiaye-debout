<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membre;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Connexion personnel back-office (Administrateur / Modérateur).
     */
    public function staffLogin(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ["Identifiants invalides."],
            ]);
        }

        return [
            'user' => $user->only('id', 'name', 'email', 'role'),
            'token' => $user->createToken('staff-login')->plainTextToken,
        ];
    }

    /**
     * Connexion membre (espace personnel) via téléphone + mot de passe.
     */
    public function membreLogin(Request $request)
    {
        $data = $request->validate([
            'telephone' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $membre = Membre::where('telephone', $data['telephone'])->first();

        if (! $membre || ! $membre->password || ! Hash::check($data['password'], $membre->password)) {
            throw ValidationException::withMessages([
                'telephone' => ["Identifiants invalides."],
            ]);
        }

        if ($membre->statut === 'en_attente') {
            throw ValidationException::withMessages([
                'telephone' => ["Votre adhésion est en attente de validation par un administrateur."],
            ]);
        }

        if ($membre->statut === 'rejete') {
            throw ValidationException::withMessages([
                'telephone' => ["Votre demande d'adhésion n'a pas été validée. Contactez le mouvement pour plus d'informations."],
            ]);
        }

        return [
            'membre' => $membre->load('quartier', 'badges'),
            'token' => $membre->createToken('membre-login')->plainTextToken,
        ];
    }

    /**
     * Retourne le principal actuellement authentifié (membre ou staff),
     * quel que soit le modèle résolu par le token Sanctum.
     */
    public function me(Request $request)
    {
        $principal = $request->user();

        return [
            'type' => $principal instanceof User ? 'staff' : 'membre',
            'data' => $principal instanceof Membre
                ? $principal->load('quartier', 'badges')
                : $principal->only('id', 'name', 'email', 'role'),
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}

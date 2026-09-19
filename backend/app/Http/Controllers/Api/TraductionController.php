<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FichierAudio;
use App\Models\Traduction;
use Illuminate\Http\Request;

class TraductionController extends Controller
{
    /**
     * Table de traduction clé → texte pour une langue donnée. Le
     * français reste géré directement dans le code du frontend (langue
     * par défaut) ; cet endpoint sert les langues additionnelles (wolof,
     * sérère) au fur et à mesure qu'elles sont saisies par l'administration.
     */
    public function index(Request $request)
    {
        $langue = $request->query('langue', 'wo');

        return Traduction::where('langue', $langue)->pluck('texte', 'cle');
    }

    public function audios(Request $request)
    {
        $langue = $request->query('langue', 'wo');

        return FichierAudio::where('langue', $langue)->get(['cle', 'url']);
    }
}

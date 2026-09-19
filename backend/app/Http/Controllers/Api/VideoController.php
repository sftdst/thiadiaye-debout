<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Video;

class VideoController extends Controller
{
    /**
     * Archive vidéo publique — uniquement les vidéos publiées, filtrables
     * par type (message, temoignage, realisation, replay).
     */
    public function index(Request $request)
    {
        $query = Video::where('statut', 'publiee')->with('quartier:id,nom,couleur');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return $query->latest()->paginate(12);
    }
}

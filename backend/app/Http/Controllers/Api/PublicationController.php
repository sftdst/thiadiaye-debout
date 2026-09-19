<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;

class PublicationController extends Controller
{
    /**
     * Actualités et bilans publiés — utilisé aussi par le chatbot pour
     * l'intent "dernières actualités" (module 9).
     */
    public function index()
    {
        return Publication::where('statut', 'publiee')
            ->orderByDesc('publie_at')
            ->limit(20)
            ->get();
    }
}

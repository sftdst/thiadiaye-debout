<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PresentationMouvement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PresentationMouvementAdminController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'description' => ['nullable', 'string'],
            'president_nom' => ['nullable', 'string', 'max:255'],
            'president_titre' => ['nullable', 'string', 'max:255'],
            'president_bio' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:4096'],
            'cv' => ['nullable', 'mimes:pdf', 'max:10240'],
        ]);

        $presentation = PresentationMouvement::firstOrCreate([]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('presentation', 'public');
            $data['president_photo_url'] = Storage::disk('public')->url($path);
        }
        unset($data['photo']);

        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('presentation', 'public');
            $data['president_cv_url'] = Storage::disk('public')->url($path);
        }
        unset($data['cv']);

        $presentation->update($data);

        return $presentation;
    }
}

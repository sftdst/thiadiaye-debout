<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticlePresse;
use Illuminate\Http\Request;

class ArticlePresseAdminController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'source' => ['required', 'string', 'max:255'],
            'lien' => ['required', 'url'],
            'image_url' => ['nullable', 'url'],
            'date_publication' => ['nullable', 'date'],
        ]);

        return response()->json(ArticlePresse::create($data), 201);
    }

    public function update(Request $request, ArticlePresse $articlePresse)
    {
        $data = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'source' => ['sometimes', 'string', 'max:255'],
            'lien' => ['sometimes', 'url'],
            'image_url' => ['nullable', 'url'],
            'date_publication' => ['nullable', 'date'],
        ]);

        $articlePresse->update($data);

        return $articlePresse;
    }

    public function destroy(ArticlePresse $articlePresse)
    {
        $articlePresse->delete();

        return response()->noContent();
    }
}

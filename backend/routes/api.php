<?php

use App\Http\Controllers\Api\Admin\ArticlePresseAdminController;
use App\Http\Controllers\Api\Admin\ContenuFormationAdminController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DefiAdminController;
use App\Http\Controllers\Api\Admin\FichierAudioAdminController;
use App\Http\Controllers\Api\Admin\EvenementAdminController;
use App\Http\Controllers\Api\Admin\IdeeAdminController;
use App\Http\Controllers\Api\Admin\LiveAdminController;
use App\Http\Controllers\Api\Admin\MembreAdminController;
use App\Http\Controllers\Api\Admin\MemoireAdminController;
use App\Http\Controllers\Api\Admin\PresentationMouvementAdminController;
use App\Http\Controllers\Api\Admin\PublicationAdminController;
use App\Http\Controllers\Api\Admin\QuartierAdminController;
use App\Http\Controllers\Api\Admin\RealisationAdminController;
use App\Http\Controllers\Api\Admin\SondageAdminController;
use App\Http\Controllers\Api\Admin\TemoignageMembreAdminController;
use App\Http\Controllers\Api\Admin\TraductionAdminController;
use App\Http\Controllers\Api\Admin\VideoAdminController;
use App\Http\Controllers\Api\AdhesionController;
use App\Http\Controllers\Api\AmbassadeurController;
use App\Http\Controllers\Api\ArticlePresseController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\IdeeController;
use App\Http\Controllers\Api\LiveController;
use App\Http\Controllers\Api\MemoireController;
use App\Http\Controllers\Api\PresentationMouvementController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\QuartierController;
use App\Http\Controllers\Api\RealisationController;
use App\Http\Controllers\Api\SondageController;
use App\Http\Controllers\Api\TableauDeBordController;
use App\Http\Controllers\Api\TemoignageMembreController;
use App\Http\Controllers\Api\TraductionController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

// Public — visiteur
Route::get('/quartiers', [QuartierController::class, 'index']);
Route::post('/adhesion', [AdhesionController::class, 'store']);
Route::post('/auth/membre/login', [AuthController::class, 'membreLogin']);
Route::post('/auth/staff/login', [AuthController::class, 'staffLogin']);

Route::get('/sondages', [SondageController::class, 'index']);
Route::get('/idees', [IdeeController::class, 'index']);
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/classement/quartiers', [GamificationController::class, 'classementQuartiers']);
Route::get('/defis', [GamificationController::class, 'defis']);
Route::get('/memoire/photos', [MemoireController::class, 'photos']);
Route::get('/memoire/temoignages', [MemoireController::class, 'temoignages']);
Route::get('/memoire/livre-or', [MemoireController::class, 'livreOr']);

Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/articles-presse', [ArticlePresseController::class, 'index']);
Route::get('/realisations', [RealisationController::class, 'index']);
Route::get('/temoignages-membres', [TemoignageMembreController::class, 'index']);
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::get('/ambassadeurs/classement', [AmbassadeurController::class, 'classement']);
Route::get('/tableau-de-bord', [TableauDeBordController::class, 'index']);
Route::get('/presentation-mouvement', [PresentationMouvementController::class, 'show']);

Route::get('/traductions', [TraductionController::class, 'index']);
Route::get('/audios', [TraductionController::class, 'audios']);

Route::get('/lives', [LiveController::class, 'index']);
Route::get('/lives/{live}', [LiveController::class, 'show']);
Route::post('/lives/{live}/join', [LiveController::class, 'join']);
Route::post('/lives/{live}/leave', [LiveController::class, 'leave']);
Route::get('/lives/{live}/chat', [LiveController::class, 'chat']);

Route::post('/chatbot/webhook', [ChatbotController::class, 'webhook'])
    ->middleware('throttle:30,1');

// Authentifié (membre ou staff)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Réservé aux membres adhérents
Route::middleware(['auth:sanctum', 'is.membre'])->group(function () {
    Route::post('/sondages/{sondage}/vote', [SondageController::class, 'vote']);
    Route::post('/idees', [IdeeController::class, 'store']);
    Route::post('/idees/{idee}/vote', [IdeeController::class, 'vote']);
    Route::post('/memoire/temoignages', [MemoireController::class, 'storeTemoignage']);
    Route::post('/memoire/livre-or', [MemoireController::class, 'storeLivreOr']);
    Route::post('/temoignages-membres', [TemoignageMembreController::class, 'store']);
    Route::post('/evenements/{evenement}/inscription', [EvenementController::class, 'inscrire']);
    Route::get('/ambassadeur/espace', [AmbassadeurController::class, 'espace']);
    Route::post('/lives/{live}/chat', [LiveController::class, 'postChat']);
});

// Réservé au personnel d'administration
Route::middleware(['auth:sanctum', 'staff.role:administrateur,moderateur'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::post('presentation-mouvement', [PresentationMouvementAdminController::class, 'update']);

    Route::apiResource('quartiers', QuartierAdminController::class)->except(['show']);
    Route::get('membres', [MembreAdminController::class, 'index']);
    Route::post('membres', [MembreAdminController::class, 'store']);
    Route::get('membres/{membre}', [MembreAdminController::class, 'show']);
    Route::put('membres/{membre}', [MembreAdminController::class, 'update']);
    Route::patch('membres/{membre}/role', [MembreAdminController::class, 'updateRole']);
    Route::patch('membres/{membre}/statut', [MembreAdminController::class, 'updateStatut']);

    Route::get('sondages', [SondageAdminController::class, 'index']);
    Route::post('sondages', [SondageAdminController::class, 'store']);
    Route::put('sondages/{sondage}', [SondageAdminController::class, 'update']);
    Route::delete('sondages/{sondage}', [SondageAdminController::class, 'destroy']);

    Route::get('idees', [IdeeAdminController::class, 'index']);
    Route::patch('idees/{idee}', [IdeeAdminController::class, 'updateStatut']);

    Route::get('videos', [VideoAdminController::class, 'index']);
    Route::post('videos', [VideoAdminController::class, 'store']);
    Route::put('videos/{video}', [VideoAdminController::class, 'update']);
    Route::patch('videos/{video}', [VideoAdminController::class, 'updateStatut']);
    Route::delete('videos/{video}', [VideoAdminController::class, 'destroy']);

    Route::apiResource('defis', DefiAdminController::class);

    Route::post('memoire/photos', [MemoireAdminController::class, 'storePhoto']);
    Route::put('memoire/photos/{archivePhoto}', [MemoireAdminController::class, 'updatePhoto']);
    Route::delete('memoire/photos/{archivePhoto}', [MemoireAdminController::class, 'destroyPhoto']);
    Route::get('memoire/temoignages', [MemoireAdminController::class, 'temoignages']);
    Route::patch('memoire/temoignages/{temoignageAncien}', [MemoireAdminController::class, 'updateTemoignageStatut']);
    Route::get('memoire/livre-or', [MemoireAdminController::class, 'livreOr']);
    Route::patch('memoire/livre-or/{messageLivreOr}', [MemoireAdminController::class, 'updateLivreOrStatut']);

    Route::get('publications', [PublicationAdminController::class, 'index']);
    Route::post('publications', [PublicationAdminController::class, 'store']);
    Route::put('publications/{publication}', [PublicationAdminController::class, 'update']);
    Route::delete('publications/{publication}', [PublicationAdminController::class, 'destroy']);

    Route::post('realisations', [RealisationAdminController::class, 'store']);
    Route::put('realisations/{realisation}', [RealisationAdminController::class, 'update']);
    Route::delete('realisations/{realisation}', [RealisationAdminController::class, 'destroy']);

    Route::post('articles-presse', [ArticlePresseAdminController::class, 'store']);
    Route::put('articles-presse/{articlePresse}', [ArticlePresseAdminController::class, 'update']);
    Route::delete('articles-presse/{articlePresse}', [ArticlePresseAdminController::class, 'destroy']);

    Route::get('temoignages-membres', [TemoignageMembreAdminController::class, 'index']);
    Route::patch('temoignages-membres/{temoignageMembre}', [TemoignageMembreAdminController::class, 'update']);

    Route::apiResource('contenus-formation', ContenuFormationAdminController::class)->except(['show']);
    Route::apiResource('evenements', EvenementAdminController::class)->except(['show']);

    Route::get('lives', [LiveAdminController::class, 'index']);
    Route::post('lives', [LiveAdminController::class, 'store']);
    Route::apiResource('traductions', TraductionAdminController::class)->except(['show']);
    Route::apiResource('fichiers-audio', FichierAudioAdminController::class)->only(['index', 'store', 'destroy']);
    Route::put('lives/{live}', [LiveAdminController::class, 'update']);
    Route::post('lives/{live}/demarrer', [LiveAdminController::class, 'demarrer']);
    Route::post('lives/{live}/terminer', [LiveAdminController::class, 'terminer']);
    Route::delete('lives/{live}', [LiveAdminController::class, 'destroy']);
});

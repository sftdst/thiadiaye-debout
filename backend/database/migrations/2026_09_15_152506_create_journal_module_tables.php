<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('contenu');
            $table->enum('type', ['actualite', 'bilan']);
            $table->enum('statut', ['brouillon', 'publiee'])->default('brouillon');
            $table->timestamp('publie_at')->nullable();
            $table->timestamps();
        });

        Schema::create('realisations', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->foreignId('quartier_id')->constrained('quartiers');
            $table->string('photo_avant_url')->nullable();
            $table->string('photo_apres_url')->nullable();
            $table->date('date_realisation')->nullable();
            $table->timestamps();
        });

        // "Témoignage de la semaine" (module 2) — distinct de temoignages_anciens (module 8, mémoire).
        Schema::create('temoignages_membres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->text('contenu');
            $table->enum('statut', ['en_attente', 'publie', 'rejete'])->default('en_attente');
            $table->date('mis_en_avant_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('temoignages_membres');
        Schema::dropIfExists('realisations');
        Schema::dropIfExists('publications');
    }
};

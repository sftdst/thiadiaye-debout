<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Module 11 — Version multilingue. Pas de synthèse vocale fiable en
     * wolof/sérère (cf. spec 5.4) : les traductions texte sont saisies par
     * l'administration, les messages vocaux sont pré-enregistrés par des
     * locuteurs natifs puis uploadés (URL de fichier audio hébergé).
     */
    public function up(): void
    {
        Schema::create('traductions', function (Blueprint $table) {
            $table->id();
            $table->string('cle');
            $table->string('langue', 10);
            $table->text('texte');
            $table->timestamps();
            $table->unique(['cle', 'langue']);
        });

        Schema::create('fichiers_audio', function (Blueprint $table) {
            $table->id();
            $table->string('cle');
            $table->string('langue', 10);
            $table->string('url');
            $table->timestamps();
            $table->unique(['cle', 'langue']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fichiers_audio');
        Schema::dropIfExists('traductions');
    }
};

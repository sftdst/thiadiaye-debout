<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archive_photos', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('url');
            $table->unsignedSmallInteger('annee')->nullable();
            $table->timestamps();
        });

        Schema::create('temoignages_anciens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membre_id')->nullable()->constrained('membres')->nullOnDelete();
            $table->string('auteur_nom');
            $table->text('contenu');
            $table->enum('statut', ['en_attente', 'publie', 'rejete'])->default('en_attente');
            $table->timestamps();
        });

        Schema::create('messages_livre_or', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membre_id')->nullable()->constrained('membres')->nullOnDelete();
            $table->string('auteur_nom');
            $table->text('message');
            $table->enum('statut', ['en_attente', 'publie', 'rejete'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages_livre_or');
        Schema::dropIfExists('temoignages_anciens');
        Schema::dropIfExists('archive_photos');
    }
};

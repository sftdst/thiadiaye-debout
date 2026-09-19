<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table à enregistrement unique (singleton) : description du mouvement
        // + présentation du président, éditée depuis l'admin, affichée sur l'accueil public.
        Schema::create('presentation_mouvement', function (Blueprint $table) {
            $table->id();
            $table->text('description')->nullable();
            $table->string('president_nom')->nullable();
            $table->string('president_titre')->nullable();
            $table->text('president_bio')->nullable();
            $table->string('president_photo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presentation_mouvement');
    }
};

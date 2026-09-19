<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('lieu')->nullable();
            $table->foreignId('quartier_id')->nullable()->constrained('quartiers')->nullOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('debut_at');
            $table->string('lien_reunion')->nullable();
            $table->boolean('reserve_ambassadeurs')->default(false);
            $table->timestamp('rappel_j1_envoye_at')->nullable();
            $table->timestamp('rappel_h1_envoye_at')->nullable();
            $table->timestamps();
        });

        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['evenement_id', 'membre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
        Schema::dropIfExists('evenements');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sondages', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->boolean('actif')->default(true);
            $table->timestamp('expire_at')->nullable();
            $table->timestamps();
        });

        Schema::create('options_sondage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sondage_id')->constrained('sondages')->cascadeOnDelete();
            $table->string('texte');
            $table->timestamps();
        });

        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sondage_id')->constrained('sondages')->cascadeOnDelete();
            $table->foreignId('option_sondage_id')->constrained('options_sondage')->cascadeOnDelete();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['sondage_id', 'membre_id']);
        });

        Schema::create('idees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->string('titre');
            $table->text('description');
            $table->enum('statut', ['en_attente', 'approuvee', 'rejetee'])->default('en_attente');
            $table->timestamps();
        });

        Schema::create('vote_idee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idee_id')->constrained('idees')->cascadeOnDelete();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['idee_id', 'membre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vote_idee');
        Schema::dropIfExists('idees');
        Schema::dropIfExists('votes');
        Schema::dropIfExists('options_sondage');
        Schema::dropIfExists('sondages');
    }
};

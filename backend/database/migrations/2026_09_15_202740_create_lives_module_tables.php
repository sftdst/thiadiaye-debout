<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Module 12 — Lives & diffusion en direct. MVP tel que recommandé par
     * la spec (section 5.2) : intégration d'un lien de live existant
     * (YouTube/Facebook Live) plutôt qu'un service de streaming dédié
     * (Mux/Agora), qui reste une évolution possible sans changer ce schéma.
     * Le compteur de viewers et le chat sont approximés par
     * heartbeat/polling en l'absence d'infrastructure WebSocket
     * (Laravel Reverb/Pusher) — cf. Étape 0.
     */
    public function up(): void
    {
        Schema::create('live_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['maire', 'quartier']);
            $table->foreignId('quartier_id')->nullable()->constrained('quartiers')->nullOnDelete();
            $table->enum('statut', ['planifie', 'en_cours', 'termine'])->default('planifie');
            $table->string('lien_stream')->nullable();
            $table->string('lien_replay')->nullable();
            $table->foreignId('video_id')->nullable()->constrained('videos')->nullOnDelete();
            $table->unsignedInteger('viewers_count')->default(0);
            $table->timestamp('planifie_at');
            $table->timestamp('demarre_at')->nullable();
            $table->timestamp('termine_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages_chat_live', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_session_id')->constrained('live_sessions')->cascadeOnDelete();
            $table->foreignId('membre_id')->constrained('membres')->cascadeOnDelete();
            $table->string('contenu', 500);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages_chat_live');
        Schema::dropIfExists('live_sessions');
    }
};

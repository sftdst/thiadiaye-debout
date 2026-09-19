<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->string('photo_profil_url')->nullable()->after('telephone');
            $table->string('cni_numero')->nullable()->unique()->after('photo_profil_url');
            $table->string('cni_recto_url')->nullable()->after('cni_numero');
            $table->string('cni_verso_url')->nullable()->after('cni_recto_url');
            // Défaut "approuve" pour ne pas bloquer les membres déjà existants (démo, tests) :
            // seule l'adhésion publique (AdhesionController) force explicitement "en_attente".
            $table->enum('statut', ['en_attente', 'approuve', 'rejete'])->default('approuve')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->dropColumn(['photo_profil_url', 'cni_numero', 'cni_recto_url', 'cni_verso_url', 'statut']);
        });
    }
};

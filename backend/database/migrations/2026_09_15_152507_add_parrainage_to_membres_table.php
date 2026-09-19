<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lien de parrainage : un membre peut avoir été recruté par un
     * ambassadeur (module 6 — Réseau des ambassadeurs). Permet de compter
     * les recrutements sans table de jonction supplémentaire.
     */
    public function up(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->foreignId('parraine_par_id')->nullable()
                ->after('quartier_id')
                ->constrained('membres')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('membres', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parraine_par_id');
        });
    }
};

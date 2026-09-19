<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('membres', function (Blueprint $table) {
            $table->id();
            $table->string('numero_carte')->unique();
            $table->string('nom');
            $table->string('telephone')->unique();
            $table->string('password')->nullable();
            $table->foreignId('quartier_id')->constrained('quartiers');
            $table->string('langue_preferee', 10)->default('fr');
            $table->enum('role', ['membre', 'ambassadeur'])->default('membre');
            $table->timestamp('date_adhesion');
            $table->boolean('consentement_donnees')->default(false);
            $table->timestamp('consentement_donnees_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membres');
    }
};

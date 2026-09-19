<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['message', 'temoignage', 'realisation', 'replay']);
            $table->string('url');
            $table->foreignId('quartier_id')->nullable()->constrained('quartiers')->nullOnDelete();
            $table->foreignId('membre_id')->nullable()->constrained('membres')->nullOnDelete();
            $table->enum('statut', ['en_attente', 'publiee', 'rejetee'])->default('publiee');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};

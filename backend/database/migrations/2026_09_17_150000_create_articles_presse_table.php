<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles_presse', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('source');
            $table->string('lien');
            $table->string('image_url')->nullable();
            $table->date('date_publication')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles_presse');
    }
};

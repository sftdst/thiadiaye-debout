<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions_chatbot', function (Blueprint $table) {
            $table->id();
            $table->string('telephone');
            $table->foreignId('membre_id')->nullable()->constrained('membres')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('messages_echanges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_chatbot_id')->constrained('sessions_chatbot')->cascadeOnDelete();
            $table->enum('direction', ['entrant', 'sortant']);
            $table->text('contenu');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages_echanges');
        Schema::dropIfExists('sessions_chatbot');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presentation_mouvement', function (Blueprint $table) {
            $table->string('president_cv_url')->nullable()->after('president_photo_url');
        });
    }

    public function down(): void
    {
        Schema::table('presentation_mouvement', function (Blueprint $table) {
            $table->dropColumn('president_cv_url');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            if (!Schema::hasColumn('recipes', 'prep_time_minutes')) {
                $table->unsignedInteger('prep_time_minutes')->nullable()->default(0);
            }
            if (!Schema::hasColumn('recipes', 'difficulty')) {
                $table->string('difficulty')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            if (Schema::hasColumn('recipes', 'prep_time_minutes')) {
                $table->dropColumn('prep_time_minutes');
            }
            if (Schema::hasColumn('recipes', 'difficulty')) {
                $table->dropColumn('difficulty');
            }
        });
    }
};

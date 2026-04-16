<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('artisan_ui_logs', function (Blueprint $table) {
            $table->id();
            $table->string('command');
            $table->json('parameters')->nullable();
            $table->string('status')->default('running'); // running, success, failed
            $table->longText('output')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('artisan_ui_logs');
    }
};

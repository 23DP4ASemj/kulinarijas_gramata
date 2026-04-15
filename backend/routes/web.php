<?php

use App\Http\Controllers\PublicStorageController;
use Illuminate\Support\Facades\Route;

Route::get('/storage/{path}', PublicStorageController::class)->where('path', '.*');

Route::get('/', function () {
    return response()->json(['message' => 'Kulinarijas Gramata API']);
});

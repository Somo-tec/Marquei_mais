<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public booking page (no auth required)
Route::get('/booking/{slug}', fn () => Inertia::render('App'))->name('booking');

// Catch-all: serve the React SPA shell for every other route
Route::get('/{any?}', fn () => Inertia::render('App'))->where('any', '.*')->name('spa');

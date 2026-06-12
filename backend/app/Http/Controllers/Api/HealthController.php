<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class HealthController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'E-Menu API is working',
        ]);
    }
}

<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrgContext;
use Illuminate\Http\Request;

class OrgController extends Controller
{
    public function show()
    {
        $org = OrgContext::org();
        return response()->json([
            'settings' => $org->settings ?? [],
        ]);
    }

    public function update(Request $request)
    {
        $org = OrgContext::org();

        $incoming = $request->validate([
            'settings' => 'required|array',
        ])['settings'];

        $merged = array_merge($org->settings ?? [], $incoming);
        $org->update(['settings' => $merged]);

        return response()->json([
            'settings' => $org->fresh()->settings,
        ]);
    }
}

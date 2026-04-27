<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Professional;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProfessionalsController extends Controller
{
    public function index()
    {
        return response()->json(Professional::where('organization_id', OrgContext::org()->id)->with('services')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:100',
            'email'              => 'nullable|email',
            'phone'              => 'nullable|string',
            'photo_url'          => 'nullable|string',
            'roles'              => 'nullable|array',
            'working_hours'      => 'nullable|array',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'service_ids'        => 'nullable|array',
        ]);

        $serviceIds = $data['service_ids'] ?? [];
        unset($data['service_ids']);

        $professional = Professional::create(['id' => Str::uuid(), 'organization_id' => OrgContext::org()->id, ...$data]);
        if ($serviceIds) $professional->services()->sync($serviceIds);

        return response()->json($professional->load('services'), 201);
    }

    public function update(Request $request, string $id)
    {
        $professional = Professional::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $data = $request->validate([
            'name'               => 'sometimes|string|max:100',
            'email'              => 'nullable|email',
            'phone'              => 'nullable|string',
            'photo_url'          => 'nullable|string',
            'roles'              => 'nullable|array',
            'working_hours'      => 'nullable|array',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'active'             => 'sometimes|boolean',
            'service_ids'        => 'nullable|array',
        ]);

        $serviceIds = $data['service_ids'] ?? null;
        unset($data['service_ids']);

        $professional->update($data);
        if ($serviceIds !== null) $professional->services()->sync($serviceIds);

        return response()->json($professional->fresh('services'));
    }

    public function destroy(string $id)
    {
        Professional::where('organization_id', OrgContext::org()->id)->findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}

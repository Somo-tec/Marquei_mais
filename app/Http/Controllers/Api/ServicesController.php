<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServicesController extends Controller
{
    public function index()
    {
        return response()->json(Service::where('organization_id', OrgContext::org()->id)->with('professionals')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:100',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:5',
            'color'            => 'nullable|string',
        ]);
        $service = Service::create(['id' => Str::uuid(), 'organization_id' => OrgContext::org()->id, ...$data]);
        return response()->json($service, 201);
    }

    public function update(Request $request, string $id)
    {
        $service = Service::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $data = $request->validate([
            'name'             => 'sometimes|string|max:100',
            'description'      => 'nullable|string',
            'price'            => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:5',
            'color'            => 'nullable|string',
            'active'           => 'sometimes|boolean',
        ]);
        $service->update($data);
        return response()->json($service->fresh());
    }

    public function destroy(string $id)
    {
        Service::where('organization_id', OrgContext::org()->id)->findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}

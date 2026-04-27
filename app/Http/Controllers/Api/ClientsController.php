<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClientsController extends Controller
{
    public function index(Request $request)
    {
        $q = Client::where('organization_id', OrgContext::org()->id);
        if ($request->search) {
            $s = "%{$request->search}%";
            $q->where(fn ($q) => $q->where('name','like',$s)->orWhere('email','like',$s)->orWhere('phone','like',$s));
        }
        if ($request->status) $q->where('status', $request->status);
        $perPage = min((int)($request->per_page ?? 50), 1000);
        return response()->json($q->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100',
            'email'     => 'nullable|email',
            'phone'     => 'nullable|string|max:20',
            'photo_url' => 'nullable|string',
            'status'    => 'nullable|in:active,inactive,vip',
            'notes'     => 'nullable|string',
        ]);
        $client = Client::create(['id' => Str::uuid(), 'organization_id' => OrgContext::org()->id, ...$data]);
        return response()->json($client, 201);
    }

    public function show(string $id)
    {
        $client = Client::where('organization_id', OrgContext::org()->id)
            ->with(['appointments.service','appointments.professional','reviews'])
            ->findOrFail($id);
        return response()->json($client);
    }

    public function update(Request $request, string $id)
    {
        $client = Client::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $data = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'email'     => 'nullable|email',
            'phone'     => 'nullable|string|max:20',
            'photo_url' => 'nullable|string',
            'status'    => 'nullable|in:active,inactive,vip',
            'notes'     => 'nullable|string',
        ]);
        $client->update($data);
        return response()->json($client->fresh());
    }

    public function destroy(string $id)
    {
        Client::where('organization_id', OrgContext::org()->id)->findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}

<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\StaffUser;
use App\Services\OrgContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json(StaffUser::where('organization_id', OrgContext::org()->id)->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,staff',
        ]);

        $user = StaffUser::create([
            'id'              => Str::uuid(),
            'organization_id' => OrgContext::org()->id,
            'name'            => $data['name'],
            'email'           => $data['email'],
            'password_hash'   => password_hash($data['password'], PASSWORD_BCRYPT),
            'role'            => $data['role'],
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, string $id)
    {
        $user = StaffUser::where('organization_id', OrgContext::org()->id)->findOrFail($id);
        $data = $request->validate([
            'name'   => 'sometimes|string|max:100',
            'role'   => 'sometimes|in:admin,staff',
            'active' => 'sometimes|boolean',
        ]);
        $user->update($data);
        return response()->json($user->fresh());
    }

    public function destroy(string $id)
    {
        StaffUser::where('organization_id', OrgContext::org()->id)->findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}

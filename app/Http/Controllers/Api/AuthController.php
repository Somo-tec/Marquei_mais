<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\StaffUser;
use App\Services\StaffTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(private StaffTokenService $tokens) {}

    public function login(Request $request)
    {
        $request->validate([
            'slug'     => 'required|string',
            'mode'     => 'required|in:user,master',
            'email'    => 'required_if:mode,user|email|nullable',
            'password' => 'required|string',
        ]);

        $org = Organization::where('slug', $request->slug)->where('active', true)->first();
        if (!$org) return response()->json(['error' => 'Estabelecimento não encontrado'], 404);

        if ($request->mode === 'master') {
            if (!hash_equals($org->master_password, $request->password)) {
                return response()->json(['error' => 'Senha incorreta'], 401);
            }
            $token = $this->tokens->issueForMaster($org);
            return response()->json([
                'token' => $token,
                'role'  => 'owner',
                'organization' => $org->only(['id','name','slug','plan','logo_url']),
            ]);
        }

        $user = StaffUser::where('organization_id', $org->id)
            ->where('email', $request->email)
            ->where('active', true)
            ->first();

        if (!$user || !password_verify($request->password, $user->password_hash)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        $token = $this->tokens->issueForUser($org, $user);
        return response()->json([
            'token' => $token,
            'role'  => $user->role,
            'user'  => $user->only(['id','name','email','role','photo_url']),
            'organization' => $org->only(['id','name','slug','plan','logo_url']),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'org_name'       => 'required|string|max:100',
            'owner_name'     => 'required|string|max:100',
            'email'          => 'required|email',
            'password'       => 'required|string|min:6',
        ]);

        $slug = Str::slug($request->org_name) . '-' . Str::random(4);
        while (Organization::where('slug', $slug)->exists()) {
            $slug = Str::slug($request->org_name) . '-' . Str::random(4);
        }

        $org = Organization::create([
            'id'              => Str::uuid(),
            'name'            => $request->org_name,
            'slug'            => $slug,
            'plan'            => 'free',
            'master_password' => $request->password,
        ]);

        $user = StaffUser::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            'name'            => $request->owner_name,
            'email'           => $request->email,
            'password_hash'   => password_hash($request->password, PASSWORD_BCRYPT),
            'role'            => 'owner',
        ]);

        $token = $this->tokens->issueForUser($org, $user);
        return response()->json([
            'token' => $token,
            'role'  => 'owner',
            'user'  => $user->only(['id','name','email','role']),
            'organization' => $org->only(['id','name','slug','plan']),
        ], 201);
    }

    public function me(Request $request)
    {
        $ctx = \App\Services\OrgContext::token();
        $org = \App\Services\OrgContext::org();

        $user = null;
        if ($ctx['sub'] !== 'master') {
            $user = StaffUser::find($ctx['sub']);
        }

        return response()->json([
            'role'         => $ctx['role'],
            'user'         => $user?->only(['id','name','email','role','photo_url']),
            'organization' => $org->only(['id','name','slug','plan','logo_url','settings']),
        ]);
    }
}

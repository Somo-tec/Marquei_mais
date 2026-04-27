<?php
namespace App\Http\Middleware;
use App\Models\Organization;
use App\Services\OrgContext;
use App\Services\StaffTokenService;
use Closure;
use Illuminate\Http\Request;

class EnsureStaffToken
{
    public function __construct(private StaffTokenService $tokens) {}

    public function handle(Request $request, Closure $next, string $level = 'staff'): mixed
    {
        $raw = $request->bearerToken()
            ?? $request->query('staff_token')
            ?? $request->cookie('marquei_staff_token');

        if (!$raw) return response()->json(['error' => 'Unauthenticated'], 401);

        $payload = $this->tokens->decode($raw);
        if (!$payload) return response()->json(['error' => 'Token inválido ou expirado'], 401);

        $org = Organization::find($payload['org_id']);
        if (!$org || !$org->active) return response()->json(['error' => 'Organização não encontrada'], 401);

        if ($level === 'admin' && !in_array($payload['role'], ['owner', 'admin'])) {
            return response()->json(['error' => 'Sem permissão'], 403);
        }

        OrgContext::set($org, $payload);
        return $next($request);
    }
}

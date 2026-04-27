<?php
namespace App\Services;
use App\Models\StaffUser;
use App\Models\Organization;

class StaffTokenService
{
    private string $secret;
    private int $ttl;

    public function __construct()
    {
        $this->secret = config('app.key');
        $this->ttl = (int) config('marquei.staff_token_ttl', 43200);
    }

    public function issueForUser(Organization $org, StaffUser $user): string
    {
        $payload = [
            'org_id' => $org->id,
            'kind'   => 'staff',
            'sub'    => $user->id,
            'role'   => $user->role,
            'iat'    => time(),
            'exp'    => time() + $this->ttl,
        ];
        return $this->encode($payload);
    }

    public function issueForMaster(Organization $org): string
    {
        $payload = [
            'org_id' => $org->id,
            'kind'   => 'staff',
            'sub'    => 'master',
            'role'   => 'owner',
            'iat'    => time(),
            'exp'    => time() + $this->ttl,
        ];
        return $this->encode($payload);
    }

    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) return null;

        [$payloadB64, $sigB64] = $parts;
        $expectedSig = $this->sign($payloadB64);
        if (!hash_equals($expectedSig, $sigB64)) return null;

        $payload = json_decode(base64_decode(strtr($payloadB64, '-_', '+/')), true);
        if (!$payload || $payload['exp'] < time()) return null;

        return $payload;
    }

    private function encode(array $payload): string
    {
        $payloadB64 = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $sig = $this->sign($payloadB64);
        return "{$payloadB64}.{$sig}";
    }

    private function sign(string $data): string
    {
        $key = base64_decode(str_replace('base64:', '', $this->secret));
        return rtrim(strtr(base64_encode(hash_hmac('sha256', $data, $key, true)), '+/', '-_'), '=');
    }
}

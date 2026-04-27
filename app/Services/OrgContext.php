<?php
namespace App\Services;
use App\Models\Organization;

class OrgContext
{
    private static ?Organization $org = null;
    private static ?array $token = null;

    public static function set(Organization $org, array $token): void
    {
        self::$org = $org;
        self::$token = $token;
    }

    public static function org(): Organization
    {
        return self::$org ?? throw new \RuntimeException('OrgContext not set');
    }

    public static function token(): array
    {
        return self::$token ?? [];
    }

    public static function role(): string
    {
        return self::$token['role'] ?? 'staff';
    }

    public static function isOwnerOrAdmin(): bool
    {
        return in_array(self::role(), ['owner', 'admin']);
    }
}

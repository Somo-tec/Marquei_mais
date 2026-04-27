<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\OrgContext;

class NotificationsController extends Controller
{
    public function index()
    {
        return response()->json(
            Notification::where('organization_id', OrgContext::org()->id)
                ->latest()->limit(50)->get()
        );
    }

    public function markRead(string $id)
    {
        Notification::where('organization_id', OrgContext::org()->id)->findOrFail($id)->update(['read' => true]);
        return response()->json(['ok' => true]);
    }

    public function markAllRead()
    {
        Notification::where('organization_id', OrgContext::org()->id)->where('read', false)->update(['read' => true]);
        return response()->json(['ok' => true]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $query = Notification::forRecipient($userId)->orderByDesc('created_at');

        if ($request->boolean('unread_only')) {
            $query->unread();
        }
        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }

        $perPage = min((int) $request->integer('per_page', 25), 100);

        return response()->json($query->paginate($perPage));
    }

    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $notification = Notification::forRecipient($userId)->findOrFail($notificationId);
        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json($notification);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $count = Notification::forRecipient($userId)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['updated' => $count]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        return response()->json([
            'unread' => Notification::forRecipient($userId)->unread()->count(),
        ]);
    }
}

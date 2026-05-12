<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Services\Contracts\NotificationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maya\Auth\Concerns\ResolvesKeycloakUser;

class NotificationController extends Controller
{
    use ResolvesKeycloakUser;

    public function __construct(
        private readonly NotificationServiceInterface $notifications,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        $perPage = min((int) $request->integer('per_page', 25), 100);
        $type    = $request->string('type')->toString() ?: null;

        // Se preserva la forma LengthAwarePaginator (`{data, current_page, …}`)
        // consumida por `useNotifications` en el sidebar compartido.
        return response()->json(
            $this->notifications->paginate(
                $recipientId,
                $request->boolean('unread_only'),
                $type,
                $perPage > 0 ? $perPage : 25,
            ),
        );
    }

    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json(
            $this->notifications->markRead($recipientId, $notificationId),
        );
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json([
            'updated' => $this->notifications->markAllRead($recipientId),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json([
            'unread' => $this->notifications->unreadCount($recipientId),
        ]);
    }
}

<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Notifications\ListNotificationsRequest;
use App\Http\Resources\NotificationResource;
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

    public function index(ListNotificationsRequest $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        $perPage = (int) ($request->validated('per_page') ?? 25);
        $type    = $request->validated('type') ?: null;

        $page = $this->notifications->paginate(
            $recipientId,
            (bool) ($request->validated('unread_only') ?? false),
            $type,
            $perPage > 0 ? $perPage : 25,
        );

        // Preserva la shape LengthAwarePaginator consumida por `useNotifications`
        // en el sidebar compartido: PaginatedDto::jsonSerialize() emite las mismas
        // claves planas (`current_page`, `data`, `per_page`, `total`, …).
        return response()->json([
            ...$page->jsonSerialize(),
            'data' => NotificationResource::collection($page->items)->resolve($request),
        ]);
    }

    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json(
            (new NotificationResource($this->notifications->markRead($recipientId, $notificationId)))->resolve($request),
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

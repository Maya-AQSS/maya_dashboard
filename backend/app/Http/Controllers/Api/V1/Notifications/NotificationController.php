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
use Maya\Http\Concerns\RespondsWithEnvelope;

class NotificationController extends Controller
{
    use ResolvesKeycloakUser;
    use RespondsWithEnvelope;

    public function __construct(
        private readonly NotificationServiceInterface $notifications,
    ) {}

    public function index(ListNotificationsRequest $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        $perPage = max(1, (int) ($request->validated('per_page') ?? 25));

        $page = $this->notifications->paginate(
            $recipientId,
            (bool) ($request->validated('unread_only') ?? false),
            $request->validated('type') ?: null,
            $perPage,
            $request->validated('app') ?: null,
            $request->validated('search') ?: null,
            $request->validated('date_from') ?: null,
            $request->validated('date_to') ?: null,
            $request->validated('sort_by') ?: 'created_at',
            $request->validated('sort_dir') ?: 'desc',
        );

        return $this->paginated($page, NotificationResource::class, $request);
    }

    public function show(Request $request, int $notificationId): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return response()->json(
            (new NotificationResource($this->notifications->find($recipientId, $notificationId)))->resolve($request),
        );
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

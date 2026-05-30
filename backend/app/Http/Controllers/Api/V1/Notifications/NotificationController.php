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

        $page = $this->notifications->paginate($recipientId, $request->toFilterDto());

        return $this->paginated($page, NotificationResource::class, $request);
    }

    public function show(Request $request, int $notificationId): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(new NotificationResource($this->notifications->find($recipientId, $notificationId)));
    }

    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(new NotificationResource($this->notifications->markRead($recipientId, $notificationId)));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(['updated' => $this->notifications->markAllRead($recipientId)]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $recipientId = (string) $this->resolveKeycloakUser($request)->id;

        return $this->okData(['unread' => $this->notifications->unreadCount($recipientId)]);
    }

    public function acknowledge(Request $request, int $notificationId): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $recipientId = (string) $user->id;

        return $this->okData(new NotificationResource($this->notifications->acknowledge($recipientId, $notificationId, $recipientId)));
    }

    public function resolve(Request $request, int $notificationId): JsonResponse
    {
        $user = $this->resolveKeycloakUser($request);
        $recipientId = (string) $user->id;

        return $this->okData(new NotificationResource($this->notifications->resolve($recipientId, $notificationId, $recipientId)));
    }
}

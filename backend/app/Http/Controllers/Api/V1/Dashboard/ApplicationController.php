<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\UserFavoriteApplication;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    use ResolvesKeycloakUser;

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveKeycloakUser($request);

        $applications = Application::where('is_active', true)
            ->selectRaw(
                'applications.*, EXISTS (
                    SELECT 1 FROM user_favorite_applications
                    WHERE user_favorite_applications.user_id = ?
                    AND user_favorite_applications.application_id = applications.id
                ) as is_favorite',
                [$user->id],
            )
            ->orderBy('name')
            ->get();

        return ApplicationResource::collection($applications);
    }
}

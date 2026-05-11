<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Maya\Auth\Concerns\ResolvesKeycloakUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    use ResolvesKeycloakUser;

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->resolveKeycloakUser($request);

        $applications = Application::where('applications.is_active', true)
            ->leftJoin(
                'user_favorite_applications',
                fn ($join) => $join
                    ->on('user_favorite_applications.application_id', '=', 'applications.id')
                    ->where('user_favorite_applications.user_id', '=', $user->id),
            )
            ->select('applications.*')
            ->selectRaw('user_favorite_applications.application_id IS NOT NULL as is_favorite')
            ->orderBy('applications.name')
            ->get();

        return ApplicationResource::collection($applications);
    }
}

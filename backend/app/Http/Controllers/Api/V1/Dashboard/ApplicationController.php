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

        $favoriteIds = $user
            ->favoriteApplications()
            ->pluck('applications.id')
            ->all();

        $applications = Application::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Application $app) use ($favoriteIds) {
                $app->is_favorite = in_array($app->id, $favoriteIds, true);
                return $app;
            });

        return ApplicationResource::collection($applications);
    }
}

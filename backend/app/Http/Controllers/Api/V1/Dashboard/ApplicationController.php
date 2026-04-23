<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $applications = Application::where('is_active', true)->orderBy('name')->get();

        return ApplicationResource::collection($applications);
    }
}

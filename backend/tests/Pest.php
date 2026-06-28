<?php

uses(Tests\TestCase::class)->in('Feature');
uses(Tests\TestCase::class)->in('Unit/DTOs');
uses(Tests\TestCase::class)->in('Unit/Services');
uses(Tests\TestCase::class)->in('Unit/Rules');
uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class)->in('Unit/Repositories');
uses(Tests\TestCase::class)->in('Unit/Middleware');

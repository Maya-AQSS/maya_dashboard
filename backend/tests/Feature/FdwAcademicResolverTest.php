<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Maya\Profile\Enums\Locale;
use Maya\Profile\Repositories\Resolvers\FdwAcademicResolver;

/**
 * Contrato del resolver de perfil enriquecido para maya_dashboard.
 *
 * Verifica que `FdwAcademicResolver` (en el paquete shared
 * `maya-shared-profile-laravel`) lee de las FDW locales que cada app del
 * ecosistema proyecta (mismas vistas que `maya_dms`) y devuelve un
 * `UserProfileDto` con los campos canónicos cross-app:
 *
 *  - `permissions`        (de `user_resolved_permissions`)
 *  - `study_type_ids`     (de `user_study_types`)
 *  - `study_ids`          (de `user_studies`)
 *  - `module_ids`         (de `user_course_modules`)
 *  - `team_ids`           (de `team_members`)
 *  - `teams`              (JOIN `team_members` × `teams`)
 *
 * El test fuerza datos en las tablas testing (stubs sin FDW) y comprueba
 * el shape del DTO devuelto. Degradación silenciosa: tablas vacías →
 * arrays vacíos, nunca null.
 */
uses(RefreshDatabase::class);

const RESOLVER_TEST_USER_ID = 'usr_resolver_test';

beforeEach(function () {
    Cache::flush();
    $this->resolver = new FdwAcademicResolver();
});

it('returns empty arrays when no local data', function () {
    $dto = $this->resolver->resolve(RESOLVER_TEST_USER_ID, [
        'id'    => RESOLVER_TEST_USER_ID,
        'email' => 'jwt@example.com',
        'name'  => 'JWT User',
    ]);

    expect($dto->id)->toBe(RESOLVER_TEST_USER_ID);
    expect($dto->email)->toBe('jwt@example.com');
    expect($dto->name)->toBe('JWT User');
    expect($dto->locale)->toEqual(Locale::default());
    expect($dto->extra['permissions'] ?? null)->toBe([]);
    expect($dto->extra['study_type_ids'] ?? null)->toBe([]);
    expect($dto->extra['study_ids'] ?? null)->toBe([]);
    expect($dto->extra['module_ids'] ?? null)->toBe([]);
    expect($dto->extra['team_ids'] ?? null)->toBe([]);
    // `teams[]` no se incluye en /me cross-app — solo `team_ids`. Las apps que
    // necesiten los objetos completos (maya_dms) lo materializan aparte.
    expect(array_key_exists('teams', $dto->extra))->toBeFalse();
});

it('enriches with academic data from fdw stubs', function () {
    DB::table('user_resolved_permissions')->insert([
        ['user_id' => RESOLVER_TEST_USER_ID, 'permission_slug' => 'audit.read'],
        ['user_id' => RESOLVER_TEST_USER_ID, 'permission_slug' => 'audit.export'],
        ['user_id' => 'other_user',          'permission_slug' => 'audit.delete'],
    ]);

    DB::table('user_study_types')->insert([
        ['id' => 'ust-1', 'user_id' => RESOLVER_TEST_USER_ID, 'study_type_id' => 'ST_ESPA'],
        ['id' => 'ust-2', 'user_id' => RESOLVER_TEST_USER_ID, 'study_type_id' => 'ST_BACH'],
        ['id' => 'ust-3', 'user_id' => 'other_user',          'study_type_id' => 'ST_FP'],
    ]);

    DB::table('user_studies')->insert([
        ['id' => 'us-1', 'user_id' => RESOLVER_TEST_USER_ID, 'study_id' => 'S_ESPA'],
        ['id' => 'us-2', 'user_id' => 'other_user',          'study_id' => 'S_BACH'],
    ]);

    DB::table('user_course_modules')->insert([
        ['id' => 'um-1', 'user_id' => RESOLVER_TEST_USER_ID, 'module_id' => 'M_MAT_1'],
        ['id' => 'um-2', 'user_id' => RESOLVER_TEST_USER_ID, 'module_id' => 'M_ENG_1'],
    ]);

    DB::table('teams')->insert([
        ['id' => 'T1', 'name' => 'Equipo Calidad',    'description' => 'QA',  'is_department' => false],
        ['id' => 'T2', 'name' => 'Departamento ESPA', 'description' => null,  'is_department' => true],
        ['id' => 'T3', 'name' => 'Otro Equipo',       'description' => null,  'is_department' => false],
    ]);

    DB::table('team_members')->insert([
        ['id' => 'tm-1', 'team_id' => 'T1', 'user_id' => RESOLVER_TEST_USER_ID, 'role' => 'member'],
        ['id' => 'tm-2', 'team_id' => 'T2', 'user_id' => RESOLVER_TEST_USER_ID, 'role' => 'lead'],
        ['id' => 'tm-3', 'team_id' => 'T3', 'user_id' => 'other_user',          'role' => 'member'],
    ]);

    $dto = $this->resolver->resolve(RESOLVER_TEST_USER_ID, ['id' => RESOLVER_TEST_USER_ID]);

    $permissions = $dto->extra['permissions'];
    sort($permissions);
    expect($permissions)->toBe(['audit.export', 'audit.read']);

    $studyTypeIds = $dto->extra['study_type_ids'];
    sort($studyTypeIds);
    expect($studyTypeIds)->toBe(['ST_BACH', 'ST_ESPA']);

    expect($dto->extra['study_ids'])->toBe(['S_ESPA']);

    $moduleIds = $dto->extra['module_ids'];
    sort($moduleIds);
    expect($moduleIds)->toBe(['M_ENG_1', 'M_MAT_1']);

    // El resolver separa equipos de trabajo (is_department=false) de los
    // departamentos (is_department=true): T1 → team_ids, T2 → department_ids.
    $teamIds = $dto->extra['team_ids'];
    sort($teamIds);
    expect($teamIds)->toBe(['T1']);

    $departmentIds = $dto->extra['department_ids'];
    sort($departmentIds);
    expect($departmentIds)->toBe(['T2']);

    // `teams[]` no se incluye en /me cross-app — solo team_ids/department_ids.
    expect(array_key_exists('teams', $dto->extra))->toBeFalse();
});

it('filters strictly by user id never returns others data', function () {
    DB::table('user_study_types')->insert([
        ['id' => 'ust-other', 'user_id' => 'other_user', 'study_type_id' => 'ST_FP'],
    ]);
    DB::table('teams')->insert([
        ['id' => 'T_OTHER', 'name' => 'Otro', 'description' => null, 'is_department' => false],
    ]);
    DB::table('team_members')->insert([
        ['id' => 'tm-other', 'team_id' => 'T_OTHER', 'user_id' => 'other_user', 'role' => 'member'],
    ]);

    $dto = $this->resolver->resolve(RESOLVER_TEST_USER_ID, ['id' => RESOLVER_TEST_USER_ID]);

    expect($dto->extra['study_type_ids'])->toBe([]);
    expect($dto->extra['team_ids'])->toBe([]);
    expect(array_key_exists('teams', $dto->extra))->toBeFalse();
});

it('returns empty arrays for empty user id', function () {
    $dto = $this->resolver->resolve('', []);

    expect($dto->extra['permissions'])->toBe([]);
    expect($dto->extra['study_type_ids'])->toBe([]);
    expect($dto->extra['study_ids'])->toBe([]);
    expect($dto->extra['module_ids'])->toBe([]);
    expect($dto->extra['team_ids'])->toBe([]);
    expect(array_key_exists('teams', $dto->extra))->toBeFalse();
});

<?php

use App\Rules\SafeAlertQuery;

function validateQuery(mixed $value): array
{
    $rule   = new SafeAlertQuery;
    $errors = [];
    $fail   = function (string $msg) use (&$errors) { $errors[] = $msg; };
    $rule->validate('query_sql', $value, $fail);

    return $errors;
}

// ─── valid queries ────────────────────────────────────────────────────────────

it('accepts a simple SELECT query', function () {
    $errors = validateQuery('SELECT count(*) FROM alerts WHERE severity = \'critical\'');

    expect($errors)->toBeEmpty();
});

it('accepts a SELECT with multiple columns', function () {
    $errors = validateQuery('SELECT id, name, severity FROM alerts ORDER BY id DESC');

    expect($errors)->toBeEmpty();
});

it('accepts a SELECT with trailing semicolon stripped', function () {
    $errors = validateQuery('SELECT 1;');

    expect($errors)->toBeEmpty();
});

it('accepts a SELECT with subquery', function () {
    $errors = validateQuery('SELECT * FROM alerts WHERE id IN (SELECT id FROM alert_rules WHERE enabled = true)');

    expect($errors)->toBeEmpty();
});

// ─── invalid: not a string ────────────────────────────────────────────────────

it('fails when value is not a string', function () {
    $errors = validateQuery(123);

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain(':attribute debe ser una cadena SQL');
});

it('fails when value is null', function () {
    $errors = validateQuery(null);

    expect($errors)->not->toBeEmpty();
});

it('fails when value is an array', function () {
    $errors = validateQuery(['SELECT 1']);

    expect($errors)->not->toBeEmpty();
});

// ─── invalid: empty ───────────────────────────────────────────────────────────

it('fails when value is an empty string', function () {
    $errors = validateQuery('');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('no puede estar vacío');
});

it('fails when value is only whitespace', function () {
    $errors = validateQuery('   ');

    expect($errors)->not->toBeEmpty();
});

// ─── invalid: must start with SELECT ─────────────────────────────────────────

it('fails when query does not start with SELECT', function () {
    $errors = validateQuery('UPDATE alerts SET severity = \'low\'');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('debe empezar por SELECT');
});

it('fails for DELETE statement', function () {
    $errors = validateQuery('DELETE FROM alerts WHERE id = 1');

    expect($errors)->not->toBeEmpty();
});

it('fails for INSERT statement', function () {
    $errors = validateQuery('INSERT INTO alerts VALUES (1, \'critical\')');

    expect($errors)->not->toBeEmpty();
});

// ─── invalid: stacked statements ─────────────────────────────────────────────

it('fails when query contains stacked statements', function () {
    $errors = validateQuery('SELECT 1; DROP TABLE alerts');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('";"');
});

it('fails for SELECT then INSERT stacked', function () {
    $errors = validateQuery('SELECT 1; INSERT INTO alerts VALUES (1, \'x\')');

    expect($errors)->not->toBeEmpty();
});

// ─── invalid: banned tokens ───────────────────────────────────────────────────

it('fails when query contains DROP', function () {
    $errors = validateQuery('SELECT * FROM alerts WHERE name = \'DROP\'');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('DROP');
});

it('fails when query contains TRUNCATE', function () {
    $errors = validateQuery('SELECT TRUNCATE(1.234, 2)');

    expect($errors)->not->toBeEmpty();
});

it('fails when query contains EXECUTE', function () {
    $errors = validateQuery('SELECT * FROM alerts; EXECUTE proc()');

    // Caught by stacked statement check first
    expect($errors)->not->toBeEmpty();
});

it('fails when query contains pg_sleep', function () {
    $errors = validateQuery('SELECT pg_sleep(10)');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('pg_sleep');
});

it('fails when query contains dblink', function () {
    $errors = validateQuery('SELECT * FROM dblink(\'host=evil.com\', \'SELECT 1\') AS t(id int)');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('dblink');
});

it('fails when query contains pg_read_file', function () {
    $errors = validateQuery('SELECT pg_read_file(\'/etc/passwd\')');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('pg_read_file');
});

it('fails when query contains set_config', function () {
    $errors = validateQuery('SELECT set_config(\'session_replication_role\', \'replica\', false)');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('set_config');
});

it('fails when query contains GRANT', function () {
    $errors = validateQuery('SELECT * FROM alerts WHERE GRANT = true');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('GRANT');
});

it('fails when query contains pg_terminate_backend', function () {
    $errors = validateQuery('SELECT pg_terminate_backend(pid) FROM pg_stat_activity');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('pg_terminate_backend');
});

// ─── comment stripping ────────────────────────────────────────────────────────

it('fails when banned token is hidden in block comment', function () {
    $errors = validateQuery("SELECT 1 /* DROP TABLE alerts */");

    expect($errors)->not->toBeEmpty();
});

it('fails when banned token is hidden in line comment', function () {
    $errors = validateQuery("SELECT 1 -- DROP TABLE alerts\n FROM x");

    expect($errors)->not->toBeEmpty();
});

// ─── new banned tokens (CRIT-1 hardening) ────────────────────────────────────

it('fails when query contains UNION', function () {
    $errors = validateQuery('SELECT id FROM alerts UNION SELECT id FROM notifications');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('UNION');
});

it('fails when query contains UNION in lowercase', function () {
    $errors = validateQuery('SELECT id FROM alerts union SELECT id FROM notifications');

    expect($errors)->not->toBeEmpty();
});

it('fails when query contains INTERSECT', function () {
    $errors = validateQuery('SELECT id FROM alerts INTERSECT SELECT id FROM notifications');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('INTERSECT');
});

it('fails when query contains EXCEPT', function () {
    $errors = validateQuery('SELECT id FROM alerts EXCEPT SELECT id FROM notifications');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('EXCEPT');
});

it('fails when query contains INTO', function () {
    $errors = validateQuery('SELECT id INTO outfile FROM alerts');

    expect($errors)->not->toBeEmpty();
    expect($errors[0])->toContain('INTO');
});

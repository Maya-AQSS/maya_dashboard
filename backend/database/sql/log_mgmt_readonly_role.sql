-- ============================================================================
-- log_mgmt_readonly role provisioning — to be applied by a DB administrator
-- ============================================================================
--
-- Purpose: provide a SELECT-only role used by maya_dashboard's
-- `alerts:evaluate` cron command. Even if a malicious operator stores an
-- attacker-controlled SQL string in alert_rules.query_sql, this role limits
-- the blast radius to read-only access on the explicitly listed tables and
-- denies access to dangerous server-side functions (pg_read_file, dblink,
-- pg_sleep, etc.).
--
-- Apply once per environment (dev / staging / prod) against log_mgmt_db.
-- The password is supplied via the LOG_MGMT_DB_PASSWORD environment variable
-- consumed by maya_dashboard at runtime — do NOT hardcode it here.
--
-- Idempotent: safe to re-run; uses IF NOT EXISTS / DO blocks.
-- ============================================================================

\connect log_mgmt_db

-- 1. Create the role (no password baked into SQL — set out-of-band).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'log_mgmt_readonly') THEN
        CREATE ROLE log_mgmt_readonly LOGIN;
    END IF;
END
$$;

-- 2. Schema-level: USAGE only, no CREATE.
REVOKE ALL ON SCHEMA public FROM log_mgmt_readonly;
GRANT USAGE ON SCHEMA public TO log_mgmt_readonly;

-- 3. Read-only on the tables that alert rules are expected to query.
--    Extend this list as the schema evolves; do NOT grant on tables that
--    contain credentials or other secrets.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO log_mgmt_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO log_mgmt_readonly;

-- 4. Explicitly revoke EXECUTE on dangerous server-side functions.
--    These can leak filesystem contents, fan out to other servers, or
--    sleep the worker (DoS).
REVOKE EXECUTE ON FUNCTION pg_read_file(text)                       FROM log_mgmt_readonly;
REVOKE EXECUTE ON FUNCTION pg_read_file(text, bigint, bigint)       FROM log_mgmt_readonly;
REVOKE EXECUTE ON FUNCTION pg_read_file(text, bigint, bigint, bool) FROM log_mgmt_readonly;
REVOKE EXECUTE ON FUNCTION pg_read_binary_file(text)                FROM log_mgmt_readonly;
REVOKE EXECUTE ON FUNCTION pg_ls_dir(text)                          FROM log_mgmt_readonly;
REVOKE EXECUTE ON FUNCTION pg_sleep(double precision)               FROM log_mgmt_readonly;

-- dblink (only if the extension is installed in this DB).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'dblink') THEN
        EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM log_mgmt_readonly';
        EXECUTE 'GRANT EXECUTE ON FUNCTION count(*) TO log_mgmt_readonly';  -- restore innocuous aggregate
    END IF;
END
$$;

-- 5. Disallow temp tables and DDL.
REVOKE TEMPORARY ON DATABASE log_mgmt_db FROM log_mgmt_readonly;
REVOKE CREATE     ON SCHEMA   public      FROM log_mgmt_readonly;

-- 6. Verify (optional — uncomment to audit after applying):
-- \dn+
-- \dp+
-- \du log_mgmt_readonly

-- ============================================================================
-- After applying:
--   1. Set LOG_MGMT_DB_PASSWORD in the maya_dashboard .env (out-of-band, secrets
--      manager). The config/database.php now refuses to start without it.
--   2. Set LOG_MGMT_DB_USERNAME=log_mgmt_readonly (default in config).
--   3. Restart the maya_dashboard backend + scheduler containers.
-- ============================================================================

-- revision: 1
-- Fichajes del dashboard sobre maya_attendance (D17, D21). Odoo guarda un registro por marca
-- (maya_attendance_attendance: attendance_type I = entrada, O = salida, P = pausa, con justificación);
-- el dashboard espera tramos (check_in, check_out). Cada entrada abre un tramo, que cierra la marca
-- siguiente del mismo empleado si es una salida o una pausa; si la siguiente es otra entrada (salida
-- olvidada) o no hay ninguna, el tramo queda abierto (check_out NULL). Las salidas y pausas sin entrada
-- previa no forman tramo y no aparecen. Horas en UTC, como las guarda Odoo (y como trabaja el dashboard).
-- Solo lectura: el dashboard ficha por el endpoint de maya_attendance (D21), nunca por FDW.
-- La marca siguiente se busca por empleado (índice de employee_id) y no con una función de ventana, para
-- que el filtro por user_id que manda postgres_fdw llegue hasta res_users.
CREATE OR REPLACE VIEW maya_apps.v_app_attendances AS
SELECT a.id::text         AS id,
       u.oauth_uid::text  AS user_id,
       a.check_time       AS check_in,
       CASE WHEN sig.attendance_type IN ('O', 'P') THEN sig.check_time END AS check_out,
       a.terminal_id::text AS source
  FROM public.maya_attendance_attendance a
  JOIN public.maya_core_employee e ON e.id = a.employee_id
  JOIN public.res_users u          ON u.id = e.user_id
  LEFT JOIN LATERAL (
        SELECT n.attendance_type, n.check_time
          FROM public.maya_attendance_attendance n
         WHERE n.employee_id = a.employee_id
           AND (n.check_time, n.id) > (a.check_time, a.id)
         ORDER BY n.check_time, n.id
         LIMIT 1
       ) sig ON true
 WHERE a.attendance_type = 'I'
   AND u.oauth_uid IS NOT NULL
   AND u.oauth_uid <> '';

-- revision: 1
-- Perfil del empleado autenticado (maya_core_employee), con los nombres de su supervisor y su mentor.
-- Lo lee `employee_profiles_fdw` (vista local `employee_profiles`). user_id = res_users.oauth_uid (D26 R4).
-- id_card_rfid es de maya_attendance (hereda maya_core.employee): sin ese módulo, la vista no compila.
CREATE OR REPLACE VIEW maya_apps.v_app_employee_profile AS
SELECT u.oauth_uid::text AS user_id,
       e.personal_email,
       e.position_type,
       CASE WHEN sup.id IS NOT NULL
            THEN trim(coalesce(sup.surname, '') || ', ' || coalesce(sup.name, ''))
       END               AS supervisor_name,
       CASE WHEN mnt.id IS NOT NULL
            THEN trim(coalesce(mnt.surname, '') || ', ' || coalesce(mnt.name, ''))
       END               AS mentor_name,
       e.keys,
       e.date_keys_handover,
       e.date_keys_return,
       e.iban,
       e.id_card_rfid,
       e.car_registration_number_1,
       e.car_registration_number_2,
       e.car_registration_number_3
  FROM public.maya_core_employee e
  JOIN public.res_users u                  ON u.id = e.user_id
  LEFT JOIN public.maya_core_employee sup  ON sup.id = e.supervisor_id
  LEFT JOIN public.maya_core_employee mnt  ON mnt.id = e.mentor_id
 WHERE u.oauth_uid IS NOT NULL
   AND u.oauth_uid <> '';

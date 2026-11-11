-- Integration tests for the account and health-data migrations using a minimal Supabase Auth stub.
-- This verifies PostgreSQL behavior in CI; it does not replace a real Supabase staging test.
create schema auth;
create schema extensions;
create role anon;
create role authenticated;
create role service_role;
create table auth.users (
  id uuid primary key,
  email text not null,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  raw_app_meta_data jsonb not null default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '')
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;

-- Supabase grants authenticated roles access to the auth helper functions.
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role(), auth.jwt() to anon, authenticated, service_role;

\ir ../migrations/20261108131911_initial_account_security.sql
\ir ../migrations/20261108131938_phone_otp_rpc.sql
\ir ../migrations/20261108131939_admin_delete.sql
\ir ../migrations/20261108131941_lock_trigger_function.sql
\ir ../migrations/20261108133235_deny_client_access_to_private_account_tables.sql
\ir ../migrations/20261108133259_restrict_admin_account_rpcs_to_service_role.sql
\ir ../migrations/20261108150015_email_only_account_activation.sql
\ir ../migrations/20261108153254_user_health_records_with_consent.sql
\ir ../migrations/20261108153447_health_records_policy_and_index_tuning.sql
\ir ../migrations/20261108154504_rls_performance_and_fk_indexes.sql
\ir ../migrations/20261108154727_health_records_delete_for_suspended_accounts.sql
\ir ../migrations/20261108155740_secure_first_admin_bootstrap.sql
\ir ../migrations/20261109180703_phone_contact_only.sql
\ir ../migrations/20261109180059_training_programs_and_assignments.sql
\ir ../migrations/20261109180115_admin_remove_workout_assignment.sql
\ir ../migrations/20261109180541_atomic_workout_assignment.sql
\ir ../migrations/20261109180708_rebuild_admin_account_directory.sql
\ir ../migrations/20261109180733_training_rpc_invoker_security.sql
\ir ../migrations/20261109180958_training_rls_and_index_tuning.sql
\ir ../migrations/20261109181028_email_only_admin_reactivation.sql
\ir ../migrations/20261109181137_preserve_workout_completion_history.sql
\ir ../migrations/20261109181208_atomic_plan_save_preserve_history.sql
\ir ../migrations/20261109181919_one_completion_per_exercise_per_day.sql
\ir ../migrations/20261109182011_persist_example_workout_history.sql

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000001','adult1@example.test',now(),
 '{"full_name":"Pessoa Teste 1","phone_e164":"+5511999990001","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000002','adult2@example.test',now(),
 '{"full_name":"Pessoa Teste 2","phone_e164":"+5511999990002","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000003','adult3@example.test',now(),
 '{"full_name":"Pessoa Teste 3","phone_e164":"+5511999990003","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000004','adult4@example.test',now(),
 '{"full_name":"Pessoa Teste 4","phone_e164":"+5511999990001","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000005','adult5@example.test',null,
 '{"full_name":"Pessoa Teste 5","phone_e164":"+5511999990005","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}');

do $$
begin
  if (select count(*) from public.profiles) <> 5 then
    raise exception 'profile_sync_failed';
  end if;
  if (select account_status from public.profiles where id='00000000-0000-4000-8000-000000000001') <> 'active' then
    raise exception 'email_confirmed_account_not_activated';
  end if;
  if (select account_status from public.profiles where id='00000000-0000-4000-8000-000000000005') <> 'pending_verification' then
    raise exception 'unconfirmed_email_account_should_start_pending';
  end if;
  update auth.users set email_confirmed_at=now()
    where id='00000000-0000-4000-8000-000000000005';
  if (select account_status from public.profiles where id='00000000-0000-4000-8000-000000000005') <> 'active' then
    raise exception 'email_confirmation_did_not_activate_account';
  end if;
  if (select count(*) from public.account_consent_events where user_id='00000000-0000-4000-8000-000000000001') <> 2 then
    raise exception 'required_consents_not_recorded';
  end if;
end $$;

do $bootstrap_permissions$
begin
  if has_function_privilege('authenticated','public.bootstrap_first_admin(uuid)','EXECUTE') then
    raise exception 'authenticated_can_bootstrap_admin';
  end if;
  if not has_function_privilege('service_role','public.bootstrap_first_admin(uuid)','EXECUTE') then
    raise exception 'service_role_cannot_bootstrap_admin';
  end if;
end;
$bootstrap_permissions$;
set role service_role;
set request.jwt.claim.role = 'service_role';
select public.bootstrap_first_admin('00000000-0000-4000-8000-000000000005');
reset role;
do $bootstrap_result$
begin
  if (select raw_app_meta_data ->> 'role' from auth.users where id='00000000-0000-4000-8000-000000000005') <> 'admin' then
    raise exception 'first_admin_bootstrap_failed';
  end if;
end;
$bootstrap_result$;

update auth.users set raw_app_meta_data='{"role":"admin"}'::jsonb
where id='00000000-0000-4000-8000-000000000001';

-- O telefone é apenas contato: não exige confirmação nem é único.
do $phone_contact_only$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='phone_e164'
  ) then
    raise exception 'contact_phone_column_missing';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='whatsapp_e164'
  ) then
    raise exception 'legacy_messaging_field_still_exposed';
  end if;
  if (select count(*) from public.profiles where phone_e164 = '+5511999990001') <> 2 then
    raise exception 'contact_phone_should_not_be_unique';
  end if;
  if to_regprocedure('public.create_phone_otp_challenge(uuid,text)') is not null
     and has_function_privilege('service_role','public.create_phone_otp_challenge(uuid,text)','EXECUTE') then
    raise exception 'legacy_phone_verification_still_executable';
  end if;
  if to_regprocedure('public.verify_phone_otp_challenge(uuid,text)') is not null
     and has_function_privilege('service_role','public.verify_phone_otp_challenge(uuid,text)','EXECUTE') then
    raise exception 'legacy_phone_verification_still_executable';
  end if;
  if to_regprocedure('public.record_phone_otp_delivery(uuid,text,text)') is not null
     and has_function_privilege('service_role','public.record_phone_otp_delivery(uuid,text,text)','EXECUTE') then
    raise exception 'legacy_phone_delivery_still_executable';
  end if;
  if has_table_privilege('service_role','public.phone_otp_challenges','SELECT')
     or has_table_privilege('service_role','public.phone_otp_send_log','SELECT') then
    raise exception 'legacy_phone_verification_tables_still_accessible';
  end if;
end;
$phone_contact_only$;

-- Health records require active verified accounts, ownership, and latest explicit consent.
insert into public.account_consent_events(user_id,consent_type,action,policy_version)
values
('00000000-0000-4000-8000-000000000001','health_data','granted','test-v1'),
('00000000-0000-4000-8000-000000000002','health_data','granted','test-v1');
insert into public.health_data_records(user_id,payload) values
('00000000-0000-4000-8000-000000000002','{"weight":"75","private":"user2"}');

-- Verify row-level access and audited admin-only status changes.
grant select on public.profiles to authenticated, anon;
grant select, insert on public.account_consent_events to authenticated;
grant select on public.admin_account_directory to authenticated;
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"}}';
do $rls$
declare
  v_denied boolean := false;
begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'rls_did_not_limit_profile_to_owner';
  end if;
  begin
    perform * from public.account_admin_audit;
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then raise exception 'authenticated_user_can_read_admin_audit'; end if;
  v_denied := false;
  begin
    perform public.admin_set_account_status('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','suspend');
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then raise exception 'non_admin_changed_account_status'; end if;
end $rls$;

set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"admin"}}';
do $rls$
begin
  if (select count(*) from public.admin_account_directory) <> 5 then
    raise exception 'admin_directory_missing_profiles';
  end if;
end $rls$;
reset role;

-- User 1 can only read/write their own records.
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"admin"}}';
insert into public.health_data_records(user_id,payload)
values ('00000000-0000-4000-8000-000000000001','{"weight":"90","meals":["feijao"]}');
update public.health_data_records
set payload='{"weight":"91","meals":["feijao","salada"]}'
where user_id='00000000-0000-4000-8000-000000000001';
do $health_rls$
declare
  v_denied boolean := false;
begin
  if (select count(*) from public.health_data_records) <> 1 then
    raise exception 'health_records_not_limited_to_owner';
  end if;
  begin
    insert into public.health_data_records(user_id,payload)
    values ('00000000-0000-4000-8000-000000000002','{"weight":"1"}');
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then raise exception 'user_inserted_another_users_health_data'; end if;
end
$health_rls$;
reset role;
insert into public.account_consent_events(user_id,consent_type,action,policy_version)
values ('00000000-0000-4000-8000-000000000001','health_data','withdrawn','test-v1');
update public.profiles set account_status='suspended'
where id='00000000-0000-4000-8000-000000000001';
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"}}';
do $health_revoke$
declare
  v_denied boolean := false;
begin
  if (select count(*) from public.health_data_records) <> 0 then
    raise exception 'withdrawn_consent_did_not_hide_health_records';
  end if;
  begin
    insert into public.health_data_records(user_id,payload)
    values ('00000000-0000-4000-8000-000000000001','{"weight":"91"}');
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then raise exception 'health_data_write_allowed_after_withdrawal'; end if;
  delete from public.health_data_records where user_id='00000000-0000-4000-8000-000000000001';
end
$health_revoke$;
reset role;
update public.profiles set account_status='active'
where id='00000000-0000-4000-8000-000000000001';

-- Privileged actions are performed only through service_role after server-side
-- verification of the admin caller stored in auth.users.raw_app_meta_data.
set role service_role;
set request.jwt.claim.role = 'service_role';
do $admin_status$
begin
  perform public.admin_set_account_status('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','suspend');
  perform public.admin_set_account_status('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','reactivate');
end $admin_status$;
reset role;
do $admin_reactivation_check$
begin
  if (select account_status from public.profiles where id='00000000-0000-4000-8000-000000000002') <> 'active' then
    raise exception 'admin_reactivation_must_only_require_confirmed_email';
  end if;
end $admin_reactivation_check$;
insert into public.health_data_records(user_id,payload)
values ('00000000-0000-4000-8000-000000000002','{"weight":"88","foodLogs":[]}');
insert into public.workout_plans(id,title,level,split_type,description,created_by)
values ('10000000-0000-4000-8000-000000000002','Plano para teste de exclusão','Iniciante','Corpo inteiro','Registro de teste','00000000-0000-4000-8000-000000000001');
insert into public.workout_plan_exercises(id,plan_id,day_label,position,exercise_name,technical_name,muscle_group)
values ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Corpo inteiro',1,'Supino','Supino reto','Peito');
insert into public.workout_assignments(id,plan_id,student_id,assigned_by)
values ('11000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001');
insert into public.workout_completions(id,assignment_id,exercise_id,student_id,exercise_name,source)
values ('12000000-0000-4000-8000-000000000002','11000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','Supino','assigned');

set role service_role;
select public.admin_delete_account('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002');
reset role;
do $account_cleanup_check$
begin
  if exists(select 1 from public.health_data_records where user_id='00000000-0000-4000-8000-000000000002') then raise exception 'account_cleanup_left_health_data'; end if;
  if exists(select 1 from public.account_consent_events where user_id='00000000-0000-4000-8000-000000000002') then raise exception 'account_cleanup_left_consent_events'; end if;
  if exists(select 1 from public.account_notification_preferences where user_id='00000000-0000-4000-8000-000000000002') then raise exception 'account_cleanup_left_notification_preferences'; end if;
  if exists(select 1 from public.workout_assignments where student_id='00000000-0000-4000-8000-000000000002') then raise exception 'account_cleanup_left_workout_assignments'; end if;
  if exists(select 1 from public.workout_completions where student_id='00000000-0000-4000-8000-000000000002') then raise exception 'account_cleanup_left_workout_completions'; end if;
end;
$account_cleanup_check$;
delete from public.workout_plans where id='10000000-0000-4000-8000-000000000002';
do $rls$
begin
  if (select count(*) from public.profiles) <> 4 then
    raise exception 'admin_delete_did_not_remove_profile';
  end if;
end $rls$;
do $rls$
begin
  if (select count(*) from public.account_admin_audit
      where target_user_id='00000000-0000-4000-8000-000000000002'
        and action in ('suspend','reactivate','delete')) <> 3 then
    raise exception 'admin_actions_not_audited';
  end if;
end $rls$;
reset request.jwt.claim.role;
reset request.jwt.claim.sub;
reset request.jwt.claims;

-- Treinos: o professor cria e atribui; cada aluno só lê e registra o próprio treino.
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"admin"}}';
insert into public.workout_plans(id,title,level,split_type,description,created_by)
values ('10000000-0000-4000-8000-000000000001','Modelo de teste','Iniciante','Corpo inteiro','Plano de demonstração', '00000000-0000-4000-8000-000000000001');
insert into public.workout_plan_exercises(id,plan_id,day_label,position,exercise_name,technical_name,muscle_group)
values ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Corpo inteiro',1,'Sentar e levantar','Agachamento com apoio','Pernas');
select public.admin_assign_workout_plan('10000000-0000-4000-8000-000000000001',array['00000000-0000-4000-8000-000000000003'::uuid]);
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"role":"user"}}';
do $training_student_access$
declare
  v_denied boolean := false;
  v_assignment_id uuid;
begin
  select id into v_assignment_id
  from public.workout_assignments
  where plan_id='10000000-0000-4000-8000-000000000001'
    and student_id='00000000-0000-4000-8000-000000000003'
    and status='active'
  order by assigned_at desc limit 1;
  if v_assignment_id is null then raise exception 'assignment_not_created'; end if;
  if (select count(*) from public.workout_assignments) <> 1 then
    raise exception 'student_cannot_read_own_assignment';
  end if;
  if (select count(*) from public.workout_plans) <> 1 then
    raise exception 'student_cannot_read_assigned_plan';
  end if;
  if (select count(*) from public.workout_plan_exercises) <> 1 then
    raise exception 'student_cannot_read_assigned_exercises';
  end if;
  update public.workout_assignments set seen_at=now()
  where id=v_assignment_id;
  insert into public.workout_completions(assignment_id,exercise_id,student_id,exercise_name)
  values (v_assignment_id,'20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','Sentar e levantar');
  begin
    insert into public.workout_assignments(plan_id,student_id,assigned_by)
    values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003');
  exception when insufficient_privilege then v_denied := true;
  end;
  if not v_denied then raise exception 'student_created_assignment'; end if;
end;
$training_student_access$;
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"admin"}}';
select public.admin_save_workout_plan(
 '10000000-0000-4000-8000-000000000001',
 'Modelo de teste atualizado','Iniciante','Corpo inteiro','Versão revisada',false,
 '[{"day_label":"Corpo inteiro","position":1,"exercise_name":"Agachar com apoio","technical_name":"Agachamento com apoio","muscle_group":"Pernas","sets":2,"reps":"8–12","rest_seconds":90,"tempo":"2 segundos para descer e 2 para subir","gym_version":"Agachar com apoio fixo","home_version":"Sentar e levantar de cadeira","knee_adaptation":"Amplitude confortável","back_adaptation":"Tronco estável","observation":"Sem dor","photo_url":"","video_url":""}]'::jsonb
);
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"role":"user"}}';
do $training_history_preserved$
begin
  if (select count(*) from public.workout_plan_exercises where exercise_name='Agachar com apoio' and is_active) <> 1 then
    raise exception 'updated_plan_did_not_show_new_active_exercise';
  end if;
  if (select count(*) from public.workout_completions where exercise_name='Sentar e levantar') <> 1 then
    raise exception 'editing_plan_deleted_completed_exercise_history';
  end if;
end;
$training_history_preserved$;
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000004';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated","app_metadata":{"role":"user"}}';
do $training_isolation$
begin
  if (select count(*) from public.workout_assignments) <> 0
     or (select count(*) from public.workout_plans) <> 0
     or (select count(*) from public.workout_plan_exercises) <> 0
     or (select count(*) from public.workout_completions) <> 0 then
    raise exception 'student_can_read_another_students_training';
  end if;
end;
$training_isolation$;
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"admin"}}';
select public.admin_remove_workout_assignment((
  select id from public.workout_assignments
  where plan_id='10000000-0000-4000-8000-000000000001'
    and student_id='00000000-0000-4000-8000-000000000003'
    and status='active'
  order by assigned_at desc limit 1
));
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"role":"user"}}';
do $training_removal$
begin
  if (select count(*) from public.workout_assignments) <> 0
     or (select count(*) from public.workout_plans) <> 0 then
    raise exception 'removed_assignment_still_visible_to_student';
  end if;
  if (select count(*) from public.workout_completions where source='assigned') <> 1 then
    raise exception 'removing_assignment_deleted_completion_history';
  end if;
  insert into public.workout_completions(assignment_id,exercise_id,student_id,exercise_name,session_date,source,program_key,day_label)
  values (null,null,'00000000-0000-4000-8000-000000000003','Caminhada leve',current_date,'example','iniciante-corpo-inteiro','Corpo inteiro');
  if (select count(*) from public.workout_completions where source='example') <> 1 then
    raise exception 'student_cannot_save_example_workout_history';
  end if;
end;
$training_removal$;
reset role;

select 'account_security_health_data_and_training_sql_tests_passed' as result;

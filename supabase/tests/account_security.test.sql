-- Integration tests for the account and OTP migrations using a minimal Supabase Auth stub.
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

\ir ../migrations/202611080001_account_security.sql
\ir ../migrations/202611080002_phone_otp_rpc.sql
\ir ../migrations/202611080003_admin_delete.sql
\ir ../migrations/202611080004_lock_trigger_function.sql
\ir ../migrations/202611080005_deny_client_access_to_private_account_tables.sql
\ir ../migrations/202611080006_restrict_admin_account_rpcs.sql
\ir ../migrations/202611080007_email_only_account_activation.sql

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000001','adult1@example.test',now(),
 '{"full_name":"Pessoa Teste 1","whatsapp_e164":"+5511999990001","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000002','adult2@example.test',now(),
 '{"full_name":"Pessoa Teste 2","whatsapp_e164":"+5511999990002","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000003','adult3@example.test',now(),
 '{"full_name":"Pessoa Teste 3","whatsapp_e164":"+5511999990003","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000004','adult4@example.test',now(),
 '{"full_name":"Pessoa Teste 4","whatsapp_e164":"+5511999990001","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}'),
('00000000-0000-4000-8000-000000000005','adult5@example.test',null,
 '{"full_name":"Pessoa Teste 5","whatsapp_e164":"+5511999990005","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true"}');

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

update auth.users set raw_app_meta_data='{"role":"admin"}'::jsonb
where id='00000000-0000-4000-8000-000000000001';

set request.jwt.claim.role = 'service_role';
do $$
declare
  v_challenge uuid;
  v_ok boolean;
begin
  v_challenge := public.create_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000001', repeat('a',64)
  );
  perform public.record_phone_otp_delivery(v_challenge,'sent','twilio_sms');
  if not exists (
    select 1 from public.phone_otp_send_log
    where challenge_id=v_challenge and outcome='sent' and provider='twilio_sms'
  ) then
    raise exception 'sms_delivery_provider_not_recorded';
  end if;
  v_ok := public.verify_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000001', repeat('a',64)
  );
  if not v_ok then raise exception 'valid_otp_was_rejected'; end if;
  if (select account_status from public.profiles where id='00000000-0000-4000-8000-000000000001') <> 'active' then
    raise exception 'verified_account_not_activated';
  end if;
end $$;

do $$
declare
  v_challenge uuid;
  i integer;
begin
  v_challenge := public.create_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000002', repeat('b',64)
  );
  for i in 1..5 loop
    if public.verify_phone_otp_challenge(
      '00000000-0000-4000-8000-000000000002', repeat('c',64)
    ) then
      raise exception 'wrong_otp_was_accepted';
    end if;
  end loop;
  if public.verify_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000002', repeat('b',64)
  ) then
    raise exception 'otp_accepted_after_attempt_limit';
  end if;
  if not exists (
    select 1 from public.phone_otp_challenges
    where id=v_challenge and attempts=5 and locked_until > now()
  ) then
    raise exception 'attempt_lock_not_applied';
  end if;
end $$;

do $$
declare
  v_challenge uuid;
  v_rejected boolean := false;
begin
  v_challenge := public.create_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000003', repeat('d',64)
  );
  update public.phone_otp_challenges
    set expires_at=now()-interval '1 second' where id=v_challenge;
  if public.verify_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000003', repeat('d',64)
  ) then
    raise exception 'expired_otp_was_accepted';
  end if;

  begin
    perform public.create_phone_otp_challenge(
      '00000000-0000-4000-8000-000000000004', repeat('e',64)
    );
  exception when others then
    if sqlerrm = 'request_not_allowed' then v_rejected := true;
    else raise; end if;
  end;
  if not v_rejected then raise exception 'verified_phone_was_not_protected'; end if;
end $$;

-- Verify the 60-second resend cooldown and three-send hourly limit.
do $$
declare
  v_rejected boolean := false;
begin
  -- Age the earlier challenge log so this test is independent of execution speed.
  update public.phone_otp_send_log
    set sent_at = now() - interval '61 seconds'
    where phone_e164 = '+5511999990003';

  perform public.create_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000003', repeat('f',64)
  );

  begin
    perform public.create_phone_otp_challenge(
      '00000000-0000-4000-8000-000000000003', repeat('1',64)
    );
  exception when others then
    if sqlerrm = 'request_not_allowed' then v_rejected := true;
    else raise; end if;
  end;
  if not v_rejected then raise exception 'otp_resend_cooldown_not_applied'; end if;

  -- Move the successful sends outside the cooldown while keeping them in the hour.
  update public.phone_otp_send_log
    set sent_at = now() - interval '61 seconds'
    where phone_e164 = '+5511999990003';

  perform public.create_phone_otp_challenge(
    '00000000-0000-4000-8000-000000000003', repeat('2',64)
  );

  update public.phone_otp_send_log
    set sent_at = now() - interval '61 seconds'
    where phone_e164 = '+5511999990003';

  v_rejected := false;
  begin
    perform public.create_phone_otp_challenge(
      '00000000-0000-4000-8000-000000000003', repeat('3',64)
    );
  exception when others then
    if sqlerrm = 'request_not_allowed' then v_rejected := true;
    else raise; end if;
  end;
  if not v_rejected then raise exception 'otp_hourly_send_limit_not_applied'; end if;
end $$;

-- Verify row-level access and audited admin-only status changes.
grant select on public.profiles to authenticated, anon;
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
    perform * from public.phone_otp_challenges;
  exception when insufficient_privilege then
    v_denied := true;
  end;
  if not v_denied then raise exception 'authenticated_user_can_read_otp_table'; end if;
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

-- Privileged actions are performed only through service_role after server-side
-- verification of the admin caller stored in auth.users.raw_app_meta_data.
set role service_role;
set request.jwt.claim.role = 'service_role';
do $admin$
begin
  perform public.admin_set_account_status('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','suspend');
  perform public.admin_set_account_status('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','reactivate');
  perform public.admin_delete_account('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002');
end $admin$;
reset role;
do $rls$
begin
  if (select count(*) from public.profiles) <> 3 then
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
select 'account_security_and_otp_sql_tests_passed' as result;

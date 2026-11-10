-- Telefone é somente contato. O acesso da conta depende exclusivamente do e-mail.
-- Mantém os artefatos históricos sem apagar dados, mas bloqueia seu uso por qualquer papel da aplicação.
drop view if exists public.admin_account_directory;

do $disable_legacy_phone_functions$
begin
  if to_regprocedure('public.create_phone_otp_challenge(uuid,text)') is not null then
    execute 'revoke all on function public.create_phone_otp_challenge(uuid,text) from public, anon, authenticated, service_role';
  end if;
  if to_regprocedure('public.record_phone_otp_delivery(uuid,text,text)') is not null then
    execute 'revoke all on function public.record_phone_otp_delivery(uuid,text,text) from public, anon, authenticated, service_role';
  end if;
  if to_regprocedure('public.verify_phone_otp_challenge(uuid,text)') is not null then
    execute 'revoke all on function public.verify_phone_otp_challenge(uuid,text) from public, anon, authenticated, service_role';
  end if;
end;
$disable_legacy_phone_functions$;

revoke all on table public.phone_otp_challenges, public.phone_otp_send_log
  from public, anon, authenticated, service_role;

drop index if exists public.profiles_verified_whatsapp_unique;
alter table public.profiles drop constraint if exists profiles_whatsapp_e164_key;
alter table public.profiles drop constraint if exists profiles_phone_e164_key;

do $rename_contact$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='whatsapp_e164'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='phone_e164'
  ) then
    alter table public.profiles rename column whatsapp_e164 to phone_e164;
  end if;
end;
$rename_contact$;

alter table public.profiles drop constraint if exists profiles_whatsapp_e164_check;
alter table public.profiles drop constraint if exists profiles_phone_e164_check;
alter table public.profiles
  add constraint profiles_phone_e164_check
  check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$');

create or replace function public.sync_auth_account_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $sync_profile$
declare
  v_name text;
  v_phone text;
begin
  v_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  v_phone := nullif(new.raw_user_meta_data ->> 'phone_e164', '');

  if tg_op = 'INSERT' then
    if coalesce(new.raw_user_meta_data ->> 'adult_confirmed','') <> 'true'
       or coalesce(new.raw_user_meta_data ->> 'terms_accepted','') <> 'true'
       or coalesce(new.raw_user_meta_data ->> 'privacy_accepted','') <> 'true' then
      raise exception 'required_signup_acknowledgements_missing';
    end if;
    if v_name is null or v_phone is null then
      raise exception 'required_account_fields_missing';
    end if;

    insert into public.profiles
      (id, full_name, email, phone_e164, email_verified_at, adult_confirmed_at)
    values
      (new.id, v_name, lower(new.email), v_phone, new.email_confirmed_at, now());

    insert into public.account_consent_events(user_id,consent_type,action,policy_version)
      values (new.id,'terms','granted',coalesce(new.raw_user_meta_data ->> 'terms_version','current')),
             (new.id,'privacy_policy','granted',coalesce(new.raw_user_meta_data ->> 'privacy_version','current'));

    if new.raw_user_meta_data ->> 'health_data_consent' = 'true' then
      insert into public.account_consent_events(user_id,consent_type,action,policy_version)
        values(new.id,'health_data','granted',coalesce(new.raw_user_meta_data ->> 'health_policy_version','current'));
    end if;
    if new.raw_user_meta_data ->> 'progress_photos_consent' = 'true' then
      insert into public.account_consent_events(user_id,consent_type,action,policy_version)
        values(new.id,'progress_photos','granted',coalesce(new.raw_user_meta_data ->> 'photos_policy_version','current'));
    end if;
    insert into public.account_notification_preferences(user_id,workout_reminders,progress_photo_reminders,product_news)
      values(new.id,
        coalesce((new.raw_user_meta_data ->> 'workout_reminders')::boolean,false),
        coalesce((new.raw_user_meta_data ->> 'progress_photo_reminders')::boolean,false),
        coalesce((new.raw_user_meta_data ->> 'product_news')::boolean,false));
  else
    update public.profiles
      set email = lower(new.email),
          email_verified_at = new.email_confirmed_at,
          updated_at = now()
      where id = new.id;
  end if;
  return new;
end;
$sync_profile$;

create or replace function public.admin_delete_account(
  p_actor_user_id uuid,
  p_target_user_id uuid
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $admin_delete$
begin
  if p_actor_user_id is null or not exists (
    select 1 from auth.users
    where id = p_actor_user_id
      and coalesce(raw_app_meta_data ->> 'role','') = 'admin'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_target_user_id = p_actor_user_id then
    raise exception 'invalid_target';
  end if;

  delete from auth.users where id = p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;

  insert into public.account_admin_audit(actor_user_id,target_user_id,action)
    values(p_actor_user_id,p_target_user_id,'delete');
end;
$admin_delete$;

revoke all on function public.admin_delete_account(uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.admin_delete_account(uuid,uuid) to service_role;

create or replace view public.admin_account_directory
with (security_invoker = true) as
select p.id, p.full_name, p.email, p.phone_e164, p.account_status,
       p.email_verified_at, p.created_at
from public.profiles p;
grant select on public.admin_account_directory to authenticated;

comment on column public.profiles.phone_e164 is
  'Telefone para contato apenas; não é identificador de login, fator de autenticação nem canal de mensagens.';
comment on table public.phone_otp_challenges is
  'Artefato legado sem acesso concedido; não utilizar no aplicativo.';
comment on table public.phone_otp_send_log is
  'Artefato legado sem acesso concedido; não utilizar no aplicativo.';

-- The old account deletion routine referred to the legacy WhatsApp column and OTP log.
-- Phone verification is disabled, so deletion now removes only the account and records the audit.
create or replace function public.admin_delete_account(
  p_actor_user_id uuid,
  p_target_user_id uuid
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $admin_delete$
begin
  if p_actor_user_id is null or not exists (
    select 1 from auth.users
    where id=p_actor_user_id
      and coalesce(raw_app_meta_data ->> 'role','')='admin'
  ) then
    raise exception 'not_authorized' using errcode='42501';
  end if;
  if p_target_user_id is null or p_target_user_id=p_actor_user_id then
    raise exception 'invalid_target';
  end if;
  if not exists (select 1 from public.profiles where id=p_target_user_id) then
    raise exception 'account_not_found';
  end if;
  delete from auth.users where id=p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;
  insert into public.account_admin_audit(actor_user_id,target_user_id,action)
    values(p_actor_user_id,p_target_user_id,'delete');
end;
$admin_delete$;
revoke all on function public.admin_delete_account(uuid,uuid) from public, anon, authenticated;
grant execute on function public.admin_delete_account(uuid,uuid) to service_role;

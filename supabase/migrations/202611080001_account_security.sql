-- Treino Seguro: base de contas e verificações.
-- Ainda NÃO aplicada a um projeto Supabase. Sem dados clínicos ou fotos.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null unique,
  whatsapp_e164 text not null unique,
  email_verified_at timestamptz,
  whatsapp_verified_at timestamptz,
  adult_confirmed_at timestamptz not null,
  account_status text not null default 'pending_verification'
    check (account_status in ('pending_verification','active','suspended')),
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(email)),
  check (whatsapp_e164 ~ '^\\+[1-9][0-9]{7,14}$')
);

create table if not exists public.account_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in
    ('terms','privacy_policy','health_data','progress_photos','notifications')),
  action text not null check (action in ('granted','withdrawn')),
  policy_version text not null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.account_notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  workout_reminders boolean not null default false,
  progress_photo_reminders boolean not null default false,
  product_news boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.phone_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null,
  code_hmac text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0 check (attempts between 0 and 5),
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  check (phone_e164 ~ '^\\+[1-9][0-9]{7,14}$')
);
create index if not exists phone_otp_challenges_phone_created_idx
  on public.phone_otp_challenges(phone_e164, created_at desc);

create table if not exists public.phone_otp_send_log (
  id bigint generated always as identity primary key,
  phone_e164 text not null,
  sent_at timestamptz not null default now(),
  provider text not null check (provider in ('meta_whatsapp','twilio_whatsapp','sms')),
  outcome text not null check (outcome in ('sent','failed','rate_limited'))
);
create index if not exists phone_otp_send_log_phone_time_idx
  on public.phone_otp_send_log(phone_e164, sent_at desc);

create table if not exists public.account_admin_audit (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  target_user_id uuid,
  action text not null check (action in ('suspend','reactivate','delete')),
  occurred_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.account_consent_events enable row level security;
alter table public.account_notification_preferences enable row level security;
alter table public.phone_otp_challenges enable row level security;
alter table public.phone_otp_send_log enable row level security;
alter table public.account_admin_audit enable row level security;

create policy "profile_read_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profile_admin_read_directory" on public.profiles
  for select to authenticated using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') = 'admin');
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "profile_update_own_name" on public.profiles
  for update to authenticated
  using (id = auth.uid() and account_status = 'active' and role = 'user')
  with check (id = auth.uid() and account_status = 'active' and role = 'user');
create policy "consent_read_own" on public.account_consent_events
  for select to authenticated using (user_id = auth.uid());
create policy "consent_insert_own" on public.account_consent_events
  for insert to authenticated with check (user_id = auth.uid());
create policy "notification_preferences_own" on public.account_notification_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.phone_otp_challenges from anon, authenticated;
revoke all on public.phone_otp_send_log from anon, authenticated;
revoke all on public.account_admin_audit from anon, authenticated;

create or replace function public.sync_auth_account_profile()
returns trigger language plpgsql security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_name text;
  v_phone text;
begin
  v_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  v_phone := nullif(new.raw_user_meta_data ->> 'whatsapp_e164', '');
  if tg_op = 'INSERT' then
    if new.raw_user_meta_data ->> 'adult_confirmed' <> 'true'
       or new.raw_user_meta_data ->> 'terms_accepted' <> 'true'
       or new.raw_user_meta_data ->> 'privacy_accepted' <> 'true' then
      raise exception 'required_signup_acknowledgements_missing';
    end if;
    if v_name is not null and v_phone is not null then
      insert into public.profiles
        (id, full_name, email, whatsapp_e164, email_verified_at, adult_confirmed_at)
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
    end if;
  else
    update public.profiles
      set email = lower(new.email),
          email_verified_at = new.email_confirmed_at,
          updated_at = now()
      where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update of email, email_confirmed_at on auth.users
  for each row execute procedure public.sync_auth_account_profile();

create or replace function public.refresh_account_activation()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.email_verified_at is not null and new.whatsapp_verified_at is not null
     and new.account_status = 'pending_verification' then
    new.account_status := 'active';
  end if;
  return new;
end;
$$;
drop trigger if exists before_profile_activation on public.profiles;
create trigger before_profile_activation
  before insert or update of email_verified_at, whatsapp_verified_at
  on public.profiles for each row execute procedure public.refresh_account_activation();

create or replace function public.admin_set_account_status(
  p_target_user_id uuid, p_action text
) returns void language plpgsql security definer
set search_path = public, auth, pg_temp
as $$
declare v_actor uuid := auth.uid();
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_action not in ('suspend','reactivate') then raise exception 'invalid_action'; end if;
  update public.profiles
    set account_status = case when p_action = 'suspend' then 'suspended'
      else case when email_verified_at is not null and whatsapp_verified_at is not null
        then 'active' else 'pending_verification' end end,
        updated_at = now()
    where id = p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;
  insert into public.account_admin_audit(actor_user_id,target_user_id,action)
    values(v_actor,p_target_user_id,p_action);
end;
$$;
revoke all on function public.admin_set_account_status(uuid,text) from public, anon;
grant execute on function public.admin_set_account_status(uuid,text) to authenticated, service_role;

create or replace view public.admin_account_directory
with (security_invoker = true) as
select p.id, p.full_name, p.email, p.whatsapp_e164, p.account_status,
       p.email_verified_at, p.whatsapp_verified_at, p.created_at
from public.profiles p;

comment on table public.profiles is
  'Dados cadastrais e status; nunca incluir avaliações, fotos, refeições, peso ou dados clínicos.';
comment on table public.phone_otp_challenges is
  'Privado. code_hmac deve ser HMAC calculado no servidor com segredo externo ao banco.';
comment on view public.admin_account_directory is
  'Diretório de gestão cadastral; não expõe dados sensíveis de saúde ou fotos.';

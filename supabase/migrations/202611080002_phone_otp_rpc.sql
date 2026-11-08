-- RPCs transacionais para OTP do WhatsApp.
-- Aplicar somente após revisão e em projeto Supabase de homologação.
-- Chamadas permitidas exclusivamente à service_role, a partir de Edge Functions.
-- Número só fica reservado depois da confirmação; evita que um cadastro não verificado
-- bloqueie o WhatsApp de seu verdadeiro titular.
alter table public.profiles drop constraint if exists profiles_whatsapp_e164_key;
create unique index if not exists profiles_verified_whatsapp_unique
  on public.profiles(whatsapp_e164) where whatsapp_verified_at is not null;

alter table public.phone_otp_challenges
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists purpose text not null default 'signup'
    check (purpose in ('signup')),
  add column if not exists locked_until timestamptz;

alter table public.phone_otp_send_log
  add column if not exists challenge_id uuid references public.phone_otp_challenges(id) on delete set null;

alter table public.phone_otp_send_log
  drop constraint if exists phone_otp_send_log_outcome_check;
alter table public.phone_otp_send_log
  add constraint phone_otp_send_log_outcome_check
  check (outcome in ('queued','sent','failed','rate_limited'));

create or replace function public.create_phone_otp_challenge(
  p_user_id uuid,
  p_code_hmac text
) returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_phone text;
  v_challenge_id uuid;
  v_send_count integer;
  v_last_send timestamptz;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_user_id is null or p_code_hmac is null
     or p_code_hmac !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_request';
  end if;

  select whatsapp_e164 into v_phone
    from public.profiles
    where id = p_user_id and account_status <> 'suspended'
      and whatsapp_verified_at is null;
  if v_phone is null then raise exception 'request_not_allowed'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_phone, 0));

  if exists (
    select 1 from public.profiles
    where whatsapp_e164 = v_phone and whatsapp_verified_at is not null
      and id <> p_user_id
  ) then
    raise exception 'request_not_allowed';
  end if;

  select count(*), max(sent_at)
    into v_send_count, v_last_send
    from public.phone_otp_send_log
    where phone_e164 = v_phone and sent_at > now() - interval '1 hour'
      and outcome in ('queued','sent','failed','rate_limited');

  if v_send_count >= 3 or (v_last_send is not null and v_last_send > now() - interval '60 seconds') then
    insert into public.phone_otp_send_log(phone_e164,provider,outcome)
      values(v_phone,'meta_whatsapp','rate_limited');
    raise exception 'request_not_allowed';
  end if;

  update public.phone_otp_challenges
    set consumed_at = coalesce(consumed_at, now())
    where user_id = p_user_id and purpose = 'signup'
      and consumed_at is null;

  insert into public.phone_otp_challenges
    (user_id,phone_e164,purpose,code_hmac,expires_at)
  values
    (p_user_id,v_phone,'signup',p_code_hmac,now() + interval '10 minutes')
  returning id into v_challenge_id;

  insert into public.phone_otp_send_log(phone_e164,challenge_id,provider,outcome)
    values(v_phone,v_challenge_id,'meta_whatsapp','queued');

  return v_challenge_id;
end;
$$;

create or replace function public.record_phone_otp_delivery(
  p_challenge_id uuid,
  p_outcome text
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_outcome not in ('sent','failed') then raise exception 'invalid_outcome'; end if;

  update public.phone_otp_send_log
    set outcome = p_outcome
    where challenge_id = p_challenge_id and outcome = 'queued';

  if not found then raise exception 'challenge_not_found'; end if;
end;
$$;

create or replace function public.verify_phone_otp_challenge(
  p_user_id uuid,
  p_code_hmac text
) returns boolean
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_challenge public.phone_otp_challenges%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_user_id is null or p_code_hmac is null
     or p_code_hmac !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  select * into v_challenge
    from public.phone_otp_challenges
    where user_id = p_user_id and purpose = 'signup'
      and consumed_at is null
    order by created_at desc
    limit 1
    for update;

  if not found or v_challenge.expires_at <= now()
     or (v_challenge.locked_until is not null and v_challenge.locked_until > now())
     or v_challenge.attempts >= 5 then
    return false;
  end if;

  if v_challenge.code_hmac <> p_code_hmac then
    update public.phone_otp_challenges
      set attempts = least(attempts + 1, 5),
          locked_until = case when attempts + 1 >= 5
            then now() + interval '15 minutes' else locked_until end
      where id = v_challenge.id;
    return false;
  end if;

  update public.phone_otp_challenges
    set verified_at = now(), consumed_at = now()
    where id = v_challenge.id;

  update public.profiles
    set whatsapp_verified_at = now(), updated_at = now()
    where id = p_user_id and whatsapp_e164 = v_challenge.phone_e164
      and account_status <> 'suspended';

  return found;
exception
  when unique_violation then
    return false;
end;
$$;

revoke all on function public.create_phone_otp_challenge(uuid,text) from public, anon, authenticated;
revoke all on function public.record_phone_otp_delivery(uuid,text) from public, anon, authenticated;
revoke all on function public.verify_phone_otp_challenge(uuid,text) from public, anon, authenticated;
grant execute on function public.create_phone_otp_challenge(uuid,text) to service_role;
grant execute on function public.record_phone_otp_delivery(uuid,text) to service_role;
grant execute on function public.verify_phone_otp_challenge(uuid,text) to service_role;

comment on function public.create_phone_otp_challenge(uuid,text) is
  'Cria OTP de cadastro com limite de 3 envios/hora, 60s entre envios e expiração de 10 min.';
comment on function public.verify_phone_otp_challenge(uuid,text) is
  'Valida OTP uma única vez; máximo de 5 tentativas e bloqueio de 15 minutos após falhas.';

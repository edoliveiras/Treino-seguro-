-- Registros pessoais de saúde: acesso individual, conta ativa e consentimento vigente.
create table if not exists public.health_data_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_data_payload_is_object check (jsonb_typeof(payload) = 'object'),
  constraint health_data_payload_size_limit check (pg_column_size(payload) <= 262144)
);

create index if not exists health_data_records_updated_at_idx
  on public.health_data_records(updated_at desc);

alter table public.health_data_records enable row level security;

revoke all on public.health_data_records from anon, authenticated;
grant select, insert, update, delete on public.health_data_records to authenticated;

create policy health_records_read_own_with_consent
on public.health_data_records for select to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action
    from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc
    limit 1
  ), 'withdrawn') = 'granted'
);

create policy health_records_insert_own_with_consent
on public.health_data_records for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action
    from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc
    limit 1
  ), 'withdrawn') = 'granted'
);

create policy health_records_update_own_with_consent
on public.health_data_records for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action
    from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc
    limit 1
  ), 'withdrawn') = 'granted'
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action
    from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc
    limit 1
  ), 'withdrawn') = 'granted'
);

-- A pessoa pode apagar seus próprios dados mesmo depois de retirar o consentimento.
create policy health_records_delete_own
on public.health_data_records for delete to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
);

create or replace function public.set_health_data_record_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger health_data_records_updated_at
before update on public.health_data_records
for each row execute function public.set_health_data_record_updated_at();

comment on table public.health_data_records is
  'Private per-user health and fitness records. Reads/writes require an active verified account and current explicit health_data consent. Photos are not stored here.';

drop index if exists public.health_data_records_updated_at_idx;

drop policy if exists health_records_read_own_with_consent on public.health_data_records;
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
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid()) and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

drop policy if exists health_records_insert_own_with_consent on public.health_data_records;
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
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid()) and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

drop policy if exists health_records_update_own_with_consent on public.health_data_records;
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
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid()) and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc limit 1
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
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid()) and e.consent_type = 'health_data'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

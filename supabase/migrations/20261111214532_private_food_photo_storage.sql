-- Private food-photo storage. No existing data or indexes are removed.
alter table public.account_consent_events
  drop constraint if exists account_consent_events_consent_type_check;

alter table public.account_consent_events
  add constraint account_consent_events_consent_type_check
  check (consent_type = any (array[
    'terms','privacy_policy','health_data','food_photos','progress_photos','notifications'
  ]::text[]));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-photos',
  'food-photos',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists food_photos_read_own_with_consent on storage.objects;
create policy food_photos_read_own_with_consent
on storage.objects for select to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'food_photos'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

drop policy if exists food_photos_insert_own_with_consent on storage.objects;
create policy food_photos_insert_own_with_consent
on storage.objects for insert to authenticated
with check (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.email_verified_at is not null
  )
  and coalesce((
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'food_photos'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

drop policy if exists food_photos_update_own_with_consent on storage.objects;
create policy food_photos_update_own_with_consent
on storage.objects for update to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and coalesce((
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'food_photos'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
)
with check (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and coalesce((
    select e.action from public.account_consent_events e
    where e.user_id = (select auth.uid())
      and e.consent_type = 'food_photos'
    order by e.occurred_at desc, e.id desc limit 1
  ), 'withdrawn') = 'granted'
);

drop policy if exists food_photos_delete_own on storage.objects;
create policy food_photos_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'food-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

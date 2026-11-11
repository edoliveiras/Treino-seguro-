drop policy if exists food_photos_update_own_with_consent on storage.objects;
create policy food_photos_update_own_with_consent
on storage.objects for update to authenticated
using (
  bucket_id='food-photos'
  and (storage.foldername(name))[1]=(select auth.uid()::text)
  and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.account_status='active' and p.email_verified_at is not null)
  and coalesce((select e.action from public.account_consent_events e where e.user_id=(select auth.uid()) and e.consent_type='food_photos' order by e.occurred_at desc,e.id desc limit 1),'declined')='granted'
  and coalesce((select e.action from public.account_consent_events e where e.user_id=(select auth.uid()) and e.consent_type='health_data' order by e.occurred_at desc,e.id desc limit 1),'declined')='granted'
)
with check (
  bucket_id='food-photos'
  and (storage.foldername(name))[1]=(select auth.uid()::text)
  and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.account_status='active' and p.email_verified_at is not null)
  and coalesce((select e.action from public.account_consent_events e where e.user_id=(select auth.uid()) and e.consent_type='food_photos' order by e.occurred_at desc,e.id desc limit 1),'declined')='granted'
  and coalesce((select e.action from public.account_consent_events e where e.user_id=(select auth.uid()) and e.consent_type='health_data' order by e.occurred_at desc,e.id desc limit 1),'declined')='granted'
);

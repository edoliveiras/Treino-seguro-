-- Optimize RLS predicates and index foreign-key access paths.
create index if not exists account_consent_events_user_occurred_idx
  on public.account_consent_events(user_id, occurred_at desc, id desc);
create index if not exists phone_otp_challenges_user_id_idx
  on public.phone_otp_challenges(user_id);
create index if not exists phone_otp_send_log_challenge_id_idx
  on public.phone_otp_send_log(challenge_id);

drop policy if exists profile_read_own on public.profiles;
drop policy if exists profile_admin_read_directory on public.profiles;
create policy profile_read_own_or_admin on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

drop policy if exists profile_update_own_name on public.profiles;
create policy profile_update_own_name on public.profiles
  for update to authenticated
  using (
    id = (select auth.uid())
    and account_status = 'active'
    and role = 'user'
  )
  with check (
    id = (select auth.uid())
    and account_status = 'active'
    and role = 'user'
  );

drop policy if exists consent_read_own on public.account_consent_events;
create policy consent_read_own on public.account_consent_events
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists consent_insert_own on public.account_consent_events;
create policy consent_insert_own on public.account_consent_events
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists notification_preferences_own on public.account_notification_preferences;
create policy notification_preferences_own on public.account_notification_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

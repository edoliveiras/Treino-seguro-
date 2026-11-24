-- Keep the account directory aligned with the current administrator status.
-- A stale JWT must not preserve access to every profile after suspension or email-verification loss.
drop policy if exists profile_read_own_or_admin on public.profiles;

create policy profile_read_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select public.is_treino_admin())
);

comment on policy profile_read_own_or_admin on public.profiles is
  'Users can read their own profile; the full directory is visible only to a currently active, email-verified administrator checked against Auth and the current profile.';

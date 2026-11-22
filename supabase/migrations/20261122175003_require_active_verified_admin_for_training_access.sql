-- Make every training/admin RLS policy re-check the administrator's current database status.
-- This prevents a stale JWT with app_metadata.role=admin from retaining access after suspension
-- or loss of email verification.
create or replace function public.is_treino_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $is_admin$
  select exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.id = auth.uid()
      and coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
      and u.email_confirmed_at is not null
      and p.email_verified_at is not null
      and p.account_status = 'active'
  );
$is_admin$;

revoke all on function public.is_treino_admin() from public, anon;
grant execute on function public.is_treino_admin() to authenticated, service_role;

comment on function public.is_treino_admin() is
  'Returns true only for a currently active, email-verified administrator; checks current auth.users and profile state rather than trusting a potentially stale JWT role claim.';

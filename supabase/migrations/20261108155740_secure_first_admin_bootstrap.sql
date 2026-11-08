-- One-time secure bootstrap for the first verified administrator.
create or replace function public.bootstrap_first_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $bootstrap$
begin
  if p_user_id is null then
    raise exception 'invalid_target';
  end if;
  if exists (
    select 1 from auth.users
    where coalesce(raw_app_meta_data ->> 'role','') = 'admin'
  ) then
    raise exception 'admin_already_initialized';
  end if;
  update auth.users u
  set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where u.id = p_user_id
    and u.email_confirmed_at is not null
    and exists (
      select 1 from public.profiles p
      where p.id = u.id
        and p.account_status = 'active'
        and p.email_verified_at is not null
    );
  if not found then
    raise exception 'verified_active_account_required';
  end if;
end;
$bootstrap$;

revoke all on function public.bootstrap_first_admin(uuid) from public, anon, authenticated;
grant execute on function public.bootstrap_first_admin(uuid) to service_role;
comment on function public.bootstrap_first_admin(uuid) is
  'One-time first-admin bootstrap; executable only by service_role and only for a verified active account when no administrator exists.';

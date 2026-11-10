-- Phone is contact-only; account reactivation depends solely on confirmed email.
create or replace function public.admin_set_account_status(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_action text
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $admin_status$
begin
  if p_actor_user_id is null or not exists (
    select 1 from auth.users
    where id=p_actor_user_id
      and coalesce(raw_app_meta_data ->> 'role','')='admin'
  ) then
    raise exception 'not_authorized' using errcode='42501';
  end if;
  if p_action not in ('suspend','reactivate') then
    raise exception 'invalid_action';
  end if;
  update public.profiles
  set account_status = case
    when p_action='suspend' then 'suspended'
    when email_verified_at is not null then 'active'
    else 'pending_verification'
  end,
  updated_at=now()
  where id=p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;
  insert into public.account_admin_audit(actor_user_id,target_user_id,action)
    values(p_actor_user_id,p_target_user_id,p_action);
end;
$admin_status$;
revoke all on function public.admin_set_account_status(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.admin_set_account_status(uuid,uuid,text) to service_role;

-- Privileged account deletion, executed atomically with an audit record.
-- The caller must have a verified admin role in Supabase Auth app_metadata.
create or replace function public.admin_delete_account(
  p_target_user_id uuid
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $admin_delete$
declare
  v_actor uuid := auth.uid();
  v_phone text;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_target_user_id = v_actor then
    raise exception 'invalid_target';
  end if;

  select whatsapp_e164 into v_phone
    from public.profiles where id = p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;

  -- Remove phone-number delivery metadata as part of the deletion request.
  delete from public.phone_otp_send_log where phone_e164 = v_phone;
  delete from auth.users where id = p_target_user_id;
  if not found then raise exception 'account_not_found'; end if;

  insert into public.account_admin_audit(actor_user_id,target_user_id,action)
    values(v_actor,p_target_user_id,'delete');
end;
$admin_delete$;

revoke all on function public.admin_delete_account(uuid) from public, anon;
grant execute on function public.admin_delete_account(uuid) to authenticated, service_role;

comment on function public.admin_delete_account(uuid) is
  'Exclui conta e dados cadastrais em cascata, remove logs de OTP associados ao telefone e registra auditoria sem PII.';

create or replace function public.admin_remove_workout_assignment(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_treino_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  update public.workout_assignments
  set status = 'removed'
  where id = p_assignment_id and status = 'active';
  if not found then raise exception 'active_assignment_not_found'; end if;
end;
$$;
revoke all on function public.admin_remove_workout_assignment(uuid) from public, anon;
grant execute on function public.admin_remove_workout_assignment(uuid) to authenticated;

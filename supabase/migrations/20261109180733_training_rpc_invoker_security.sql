-- Admin RPCs use caller privileges and RLS; no SECURITY DEFINER is needed.
create or replace function public.is_treino_admin()
returns boolean
language sql
stable
set search_path = public, auth, pg_temp
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'),'') = 'admin';
$$;
revoke all on function public.is_treino_admin() from public, anon;
grant execute on function public.is_treino_admin() to authenticated;

grant update (status) on public.workout_assignments to authenticated;

create or replace function public.admin_assign_workout_plan(
  p_plan_id uuid,
  p_student_ids uuid[]
) returns integer
language plpgsql
set search_path = public, auth, pg_temp
as $$
declare
  v_student_id uuid;
  v_assigned integer := 0;
begin
  if not public.is_treino_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_plan_id is null or p_student_ids is null
     or cardinality(p_student_ids) < 1 or cardinality(p_student_ids) > 100 then
    raise exception 'invalid_assignment';
  end if;
  if not exists (select 1 from public.workout_plans where id=p_plan_id) then
    raise exception 'plan_not_found';
  end if;
  for v_student_id in select distinct unnest(p_student_ids)
  loop
    if not exists (
      select 1 from public.profiles p
      where p.id=v_student_id and p.account_status='active' and p.email_verified_at is not null
    ) then
      raise exception 'active_verified_student_required';
    end if;
  end loop;
  for v_student_id in select distinct unnest(p_student_ids)
  loop
    update public.workout_assignments set status='removed'
    where student_id=v_student_id and status='active';
    insert into public.workout_assignments(plan_id,student_id,assigned_by,status)
    values(p_plan_id,v_student_id,auth.uid(),'active');
    v_assigned := v_assigned + 1;
  end loop;
  return v_assigned;
end;
$$;
revoke all on function public.admin_assign_workout_plan(uuid,uuid[]) from public, anon;
grant execute on function public.admin_assign_workout_plan(uuid,uuid[]) to authenticated;

create or replace function public.admin_remove_workout_assignment(p_assignment_id uuid)
returns void
language plpgsql
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

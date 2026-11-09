-- Combine read/update policies to avoid repeated permissive policy evaluation.
drop policy if exists workout_plans_admin_all on public.workout_plans;
drop policy if exists workout_plans_student_read_assigned on public.workout_plans;
create policy workout_plans_read_access on public.workout_plans
  for select to authenticated using (
    public.is_treino_admin() or exists (
      select 1 from public.workout_assignments a
      where a.plan_id=workout_plans.id and a.student_id=(select auth.uid()) and a.status='active'
    )
  );
create policy workout_plans_insert_admin on public.workout_plans
  for insert to authenticated with check (public.is_treino_admin());
create policy workout_plans_update_admin on public.workout_plans
  for update to authenticated using (public.is_treino_admin()) with check (public.is_treino_admin());
create policy workout_plans_delete_admin on public.workout_plans
  for delete to authenticated using (public.is_treino_admin());

drop policy if exists workout_plan_exercises_admin_all on public.workout_plan_exercises;
drop policy if exists workout_plan_exercises_student_read_assigned on public.workout_plan_exercises;
create policy workout_plan_exercises_read_access on public.workout_plan_exercises
  for select to authenticated using (
    public.is_treino_admin() or exists (
      select 1 from public.workout_assignments a
      where a.plan_id=workout_plan_exercises.plan_id and a.student_id=(select auth.uid()) and a.status='active'
    )
  );
create policy workout_plan_exercises_insert_admin on public.workout_plan_exercises
  for insert to authenticated with check (public.is_treino_admin());
create policy workout_plan_exercises_update_admin on public.workout_plan_exercises
  for update to authenticated using (public.is_treino_admin()) with check (public.is_treino_admin());
create policy workout_plan_exercises_delete_admin on public.workout_plan_exercises
  for delete to authenticated using (public.is_treino_admin());

drop policy if exists workout_assignments_admin_all on public.workout_assignments;
drop policy if exists workout_assignments_student_read_own on public.workout_assignments;
drop policy if exists workout_assignments_student_mark_seen on public.workout_assignments;
create policy workout_assignments_read_access on public.workout_assignments
  for select to authenticated using (
    public.is_treino_admin() or (student_id=(select auth.uid()) and status='active')
  );
create policy workout_assignments_insert_admin on public.workout_assignments
  for insert to authenticated with check (public.is_treino_admin());
create policy workout_assignments_update_access on public.workout_assignments
  for update to authenticated using (
    public.is_treino_admin() or (student_id=(select auth.uid()) and status='active')
  ) with check (
    public.is_treino_admin() or (student_id=(select auth.uid()) and status='active')
  );
create policy workout_assignments_delete_admin on public.workout_assignments
  for delete to authenticated using (public.is_treino_admin());

drop policy if exists workout_completions_admin_read on public.workout_completions;
drop policy if exists workout_completions_student_read_own on public.workout_completions;
create policy workout_completions_read_access on public.workout_completions
  for select to authenticated using (public.is_treino_admin() or student_id=(select auth.uid()));

create index if not exists workout_assignments_plan_id_idx on public.workout_assignments(plan_id);
create index if not exists workout_assignments_assigned_by_idx on public.workout_assignments(assigned_by);
create index if not exists workout_completions_assignment_id_idx on public.workout_completions(assignment_id);
create index if not exists workout_completions_exercise_id_idx on public.workout_completions(exercise_id);
create index if not exists workout_plans_created_by_idx on public.workout_plans(created_by);

-- Keep exercise rows as history anchors; editing a plan must not erase completed sessions.
alter table public.workout_plan_exercises
  add column if not exists is_active boolean not null default true;
alter table public.workout_completions
  add column if not exists exercise_name text not null default '';

alter table public.workout_plan_exercises
  drop constraint if exists workout_plan_exercises_position_check;
alter table public.workout_plan_exercises
  add constraint workout_plan_exercises_position_check check (position between 1 and 10000);

drop policy if exists workout_plan_exercises_read_access on public.workout_plan_exercises;
create policy workout_plan_exercises_read_access on public.workout_plan_exercises
  for select to authenticated using (
    public.is_treino_admin() or (
      is_active and exists (
        select 1 from public.workout_assignments a
        where a.plan_id=workout_plan_exercises.plan_id
          and a.student_id=(select auth.uid()) and a.status='active'
      )
    )
  );

drop policy if exists workout_completions_student_insert_own on public.workout_completions;
create policy workout_completions_student_insert_own on public.workout_completions
  for insert to authenticated with check (
    student_id=(select auth.uid())
    and exists (
      select 1 from public.workout_assignments a
      join public.workout_plan_exercises e on e.plan_id=a.plan_id
      where a.id=workout_completions.assignment_id
        and e.id=workout_completions.exercise_id
        and e.is_active
        and a.student_id=(select auth.uid())
        and a.status='active'
    )
  );

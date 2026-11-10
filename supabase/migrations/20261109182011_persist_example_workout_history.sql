alter table public.workout_completions
  alter column assignment_id drop not null,
  alter column exercise_id drop not null,
  add column if not exists source text not null default 'assigned'
    check (source in ('assigned','example')),
  add column if not exists program_key text,
  add column if not exists day_label text;

alter table public.workout_completions
  drop constraint if exists workout_completions_source_shape_check;
alter table public.workout_completions
  add constraint workout_completions_source_shape_check check (
    (source='assigned' and assignment_id is not null and exercise_id is not null)
    or
    (source='example' and assignment_id is null and exercise_id is null
      and program_key is not null and day_label is not null)
  );

drop policy if exists workout_completions_student_insert_own on public.workout_completions;
create policy workout_completions_student_insert_own on public.workout_completions
  for insert to authenticated with check (
    student_id=(select auth.uid())
    and (
      (source='assigned' and assignment_id is not null and exercise_id is not null
        and exists (
          select 1 from public.workout_assignments a
          join public.workout_plan_exercises e on e.plan_id=a.plan_id
          where a.id=workout_completions.assignment_id
            and e.id=workout_completions.exercise_id
            and e.is_active and a.student_id=(select auth.uid()) and a.status='active'
        )
      )
      or
      (source='example' and assignment_id is null and exercise_id is null
        and program_key is not null and day_label is not null
        and char_length(trim(exercise_name)) between 2 and 120)
    )
  );

create unique index if not exists workout_completions_example_day_uidx
  on public.workout_completions(student_id,program_key,day_label,exercise_name,session_date)
  where source='example';

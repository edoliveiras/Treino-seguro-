create unique index if not exists workout_completions_assignment_exercise_day_uidx
  on public.workout_completions(assignment_id,exercise_id,session_date);

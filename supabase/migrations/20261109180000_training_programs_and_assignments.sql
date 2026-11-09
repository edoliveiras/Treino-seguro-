-- Treino Seguro: planos do professor, atribuições individuais e registro de sessões.
-- Os dados de treino ficam separados dos registros clínicos e protegidos por RLS.

alter table public.profiles
  add column if not exists training_level text not null default 'Iniciante'
    check (training_level in ('Iniciante','Intermediário','Avançado')),
  add column if not exists training_place text not null default 'Casa'
    check (training_place in ('Casa','Academia')),
  add column if not exists training_days smallint not null default 3
    check (training_days between 2 and 6);

grant update (training_level, training_place, training_days) on public.profiles to authenticated;

create or replace function public.is_treino_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and coalesce(u.raw_app_meta_data ->> 'role','') = 'admin'
  );
$$;
revoke all on function public.is_treino_admin() from public, anon;
grant execute on function public.is_treino_admin() to authenticated;

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 120),
  level text not null check (level in ('Iniciante','Intermediário','Avançado')),
  split_type text not null check (split_type in ('Corpo inteiro','Superior e inferior','Empurrar, puxar e pernas','Personalizado')),
  description text not null default '',
  duration_weeks smallint not null default 7 check (duration_weeks between 1 and 16),
  is_template boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  day_label text not null check (char_length(trim(day_label)) between 1 and 60),
  position smallint not null check (position between 1 and 20),
  exercise_name text not null check (char_length(trim(exercise_name)) between 2 and 120),
  technical_name text not null default '',
  muscle_group text not null default 'Corpo inteiro',
  sets smallint not null default 2 check (sets between 1 and 8),
  reps text not null default '8–12' check (char_length(reps) <= 40),
  rest_seconds smallint not null default 90 check (rest_seconds between 15 and 600),
  tempo text not null default '2 segundos para descer, 2 para subir' check (char_length(tempo) <= 120),
  gym_version text not null default '',
  home_version text not null default '',
  knee_adaptation text not null default '',
  back_adaptation text not null default '',
  observation text not null default '',
  photo_url text not null default '',
  video_url text not null default '',
  created_at timestamptz not null default now(),
  unique (plan_id, day_label, position)
);

create table if not exists public.workout_assignments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'active' check (status in ('active','removed')),
  assigned_at timestamptz not null default now(),
  seen_at timestamptz
);

create table if not exists public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.workout_assignments(id) on delete cascade,
  exercise_id uuid not null references public.workout_plan_exercises(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz not null default now(),
  session_date date not null default current_date,
  note text not null default '' check (char_length(note) <= 500)
);

create index if not exists workout_assignments_student_active_idx
  on public.workout_assignments(student_id, assigned_at desc) where status='active';
create index if not exists workout_plan_exercises_plan_day_idx
  on public.workout_plan_exercises(plan_id, day_label, position);
create index if not exists workout_completions_student_date_idx
  on public.workout_completions(student_id, session_date desc);

alter table public.workout_plans enable row level security;
alter table public.workout_plan_exercises enable row level security;
alter table public.workout_assignments enable row level security;
alter table public.workout_completions enable row level security;

grant select, insert, update, delete on public.workout_plans to authenticated;
grant select, insert, update, delete on public.workout_plan_exercises to authenticated;
grant select, insert, delete on public.workout_assignments to authenticated;
grant update (seen_at) on public.workout_assignments to authenticated;
grant select, insert, delete on public.workout_completions to authenticated;

create policy workout_plans_admin_all on public.workout_plans
  for all to authenticated using (public.is_treino_admin())
  with check (public.is_treino_admin());
create policy workout_plans_student_read_assigned on public.workout_plans
  for select to authenticated using (
    exists (
      select 1 from public.workout_assignments a
      where a.plan_id = workout_plans.id
        and a.student_id = (select auth.uid())
        and a.status = 'active'
    )
  );

create policy workout_plan_exercises_admin_all on public.workout_plan_exercises
  for all to authenticated using (public.is_treino_admin())
  with check (public.is_treino_admin());
create policy workout_plan_exercises_student_read_assigned on public.workout_plan_exercises
  for select to authenticated using (
    exists (
      select 1 from public.workout_assignments a
      where a.plan_id = workout_plan_exercises.plan_id
        and a.student_id = (select auth.uid())
        and a.status = 'active'
    )
  );

create policy workout_assignments_admin_all on public.workout_assignments
  for all to authenticated using (public.is_treino_admin())
  with check (public.is_treino_admin());
create policy workout_assignments_student_read_own on public.workout_assignments
  for select to authenticated using (student_id = (select auth.uid()) and status = 'active');
create policy workout_assignments_student_mark_seen on public.workout_assignments
  for update to authenticated using (
    student_id = (select auth.uid()) and status = 'active'
  ) with check (
    student_id = (select auth.uid()) and status = 'active'
  );

create policy workout_completions_admin_read on public.workout_completions
  for select to authenticated using (public.is_treino_admin());
create policy workout_completions_student_read_own on public.workout_completions
  for select to authenticated using (student_id = (select auth.uid()));
create policy workout_completions_student_insert_own on public.workout_completions
  for insert to authenticated with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.workout_assignments a
      join public.workout_plan_exercises e on e.plan_id = a.plan_id
      where a.id = workout_completions.assignment_id
        and e.id = workout_completions.exercise_id
        and a.student_id = (select auth.uid())
        and a.status = 'active'
    )
  );
create policy workout_completions_student_delete_own on public.workout_completions
  for delete to authenticated using (student_id = (select auth.uid()));

create or replace function public.set_workout_updated_at()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists workout_plans_updated_at on public.workout_plans;
create trigger workout_plans_updated_at before update on public.workout_plans
  for each row execute function public.set_workout_updated_at();

drop view if exists public.admin_account_directory;
create view public.admin_account_directory with (security_invoker = true) as
select p.id, p.full_name, p.email, p.whatsapp_e164, p.account_status,
       p.email_verified_at, p.whatsapp_verified_at, p.created_at,
       p.training_level, p.training_place, p.training_days,
       (
         select wp.title
         from public.workout_assignments wa
         join public.workout_plans wp on wp.id = wa.plan_id
         where wa.student_id = p.id and wa.status = 'active'
         order by wa.assigned_at desc
         limit 1
       ) as current_workout
from public.profiles p;

comment on table public.workout_plans is 'Modelos e planos individuais de treino. Acesso administrativo e leitura pelo aluno atribuído.';
comment on table public.workout_assignments is 'Vínculo privado entre um plano e cada aluno; cada aluno enxerga somente suas próprias atribuições.';
comment on table public.workout_completions is 'Registro de exercícios concluídos pelo próprio aluno e histórico de evolução do treino.';

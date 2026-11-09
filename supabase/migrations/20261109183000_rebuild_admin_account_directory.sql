drop view if exists public.admin_account_directory;
create view public.admin_account_directory with (security_invoker = true) as
select p.id,p.full_name,p.email,p.phone_e164,p.account_status,p.email_verified_at,
       p.created_at,p.training_level,p.training_place,p.training_days,
       (select wp.title from public.workout_assignments wa
        join public.workout_plans wp on wp.id=wa.plan_id
        where wa.student_id=p.id and wa.status='active'
        order by wa.assigned_at desc limit 1) as current_workout
from public.profiles p;
grant select on public.admin_account_directory to authenticated;
comment on view public.admin_account_directory is
  'Diretório cadastral para o painel privado do professor; não expõe dados clínicos.';

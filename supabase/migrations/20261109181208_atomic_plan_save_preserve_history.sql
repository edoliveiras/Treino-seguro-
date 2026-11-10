-- Allow archived exercise versions to keep completion history while active positions remain unique.
alter table public.workout_plan_exercises
  drop constraint if exists workout_plan_exercises_plan_id_day_label_position_key;
create unique index if not exists workout_plan_exercises_active_position_idx
  on public.workout_plan_exercises(plan_id,day_label,position) where is_active;
grant update (is_active) on public.workout_plan_exercises to authenticated;

create or replace function public.admin_save_workout_plan(
  p_plan_id uuid,
  p_title text,
  p_level text,
  p_split_type text,
  p_description text,
  p_is_template boolean,
  p_exercises jsonb
) returns uuid
language plpgsql
set search_path = public, auth, pg_temp
as $$
declare
  v_plan_id uuid := p_plan_id;
begin
  if not public.is_treino_admin() then
    raise exception 'not_authorized' using errcode='42501';
  end if;
  if p_title is null or char_length(trim(p_title)) not between 2 and 120
     or p_level not in ('Iniciante','Intermediário','Avançado')
     or p_split_type not in ('Corpo inteiro','Superior e inferior','Empurrar, puxar e pernas','Personalizado')
     or jsonb_typeof(p_exercises) <> 'array'
     or jsonb_array_length(p_exercises) < 1
     or jsonb_array_length(p_exercises) > 100 then
    raise exception 'invalid_workout_plan';
  end if;
  if v_plan_id is null then
    insert into public.workout_plans(title,level,split_type,description,duration_weeks,is_template,created_by)
    values(trim(p_title),p_level,p_split_type,coalesce(p_description,''),7,coalesce(p_is_template,false),auth.uid())
    returning id into v_plan_id;
  else
    update public.workout_plans
    set title=trim(p_title),level=p_level,split_type=p_split_type,
        description=coalesce(p_description,''),is_template=coalesce(p_is_template,false)
    where id=v_plan_id;
    if not found then raise exception 'workout_plan_not_found'; end if;
  end if;

  update public.workout_plan_exercises
  set is_active=false
  where plan_id=v_plan_id and is_active;

  insert into public.workout_plan_exercises(
    plan_id,day_label,position,exercise_name,technical_name,muscle_group,sets,reps,
    rest_seconds,tempo,gym_version,home_version,knee_adaptation,back_adaptation,
    observation,photo_url,video_url,is_active
  )
  select v_plan_id,x.day_label,x.position,x.exercise_name,coalesce(x.technical_name,''),
    coalesce(x.muscle_group,'Corpo inteiro'),x.sets,x.reps,x.rest_seconds,
    coalesce(x.tempo,''),coalesce(x.gym_version,''),coalesce(x.home_version,''),
    coalesce(x.knee_adaptation,''),coalesce(x.back_adaptation,''),coalesce(x.observation,''),
    coalesce(x.photo_url,''),coalesce(x.video_url,''),true
  from jsonb_to_recordset(p_exercises) as x(
    day_label text,position smallint,exercise_name text,technical_name text,muscle_group text,
    sets smallint,reps text,rest_seconds smallint,tempo text,gym_version text,home_version text,
    knee_adaptation text,back_adaptation text,observation text,photo_url text,video_url text
  );
  return v_plan_id;
end;
$$;
revoke all on function public.admin_save_workout_plan(uuid,text,text,text,text,boolean,jsonb) from public, anon;
grant execute on function public.admin_save_workout_plan(uuid,text,text,text,text,boolean,jsonb) to authenticated;

-- Record both acceptance and refusal for the two independent optional consents.
alter table public.account_consent_events
  drop constraint if exists account_consent_events_action_check;
alter table public.account_consent_events
  add constraint account_consent_events_action_check
  check (action = any (array['granted','declined','withdrawn']::text[]));

create or replace function public.sync_auth_account_profile()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth', 'pg_temp'
as $function$
declare
  v_name text;
  v_phone text;
  v_health_consent text;
  v_food_photo_consent text;
begin
  v_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  v_phone := nullif(new.raw_user_meta_data ->> 'phone_e164', '');
  if tg_op = 'INSERT' then
    if coalesce(new.raw_user_meta_data ->> 'adult_confirmed','') <> 'true'
       or coalesce(new.raw_user_meta_data ->> 'terms_accepted','') <> 'true'
       or coalesce(new.raw_user_meta_data ->> 'privacy_accepted','') <> 'true' then
      raise exception 'required_signup_acknowledgements_missing';
    end if;
    if v_name is null or v_phone is null then
      raise exception 'required_account_fields_missing';
    end if;

    insert into public.profiles
      (id, full_name, email, phone_e164, email_verified_at, adult_confirmed_at)
    values
      (new.id, v_name, lower(new.email), v_phone, new.email_confirmed_at, now());

    insert into public.account_consent_events(user_id,consent_type,action,policy_version)
      values (new.id,'terms','granted',coalesce(new.raw_user_meta_data ->> 'terms_version','current')),
             (new.id,'privacy_policy','granted',coalesce(new.raw_user_meta_data ->> 'privacy_version','current'));

    v_health_consent := case when new.raw_user_meta_data ->> 'health_data_consent' = 'true' then 'granted' else 'declined' end;
    insert into public.account_consent_events(user_id,consent_type,action,policy_version)
      values(new.id,'health_data',v_health_consent,coalesce(new.raw_user_meta_data ->> 'health_policy_version','2026-11-11'));

    v_food_photo_consent := case when new.raw_user_meta_data ->> 'food_photos_consent' = 'true' then 'granted' else 'declined' end;
    insert into public.account_consent_events(user_id,consent_type,action,policy_version)
      values(new.id,'food_photos',v_food_photo_consent,coalesce(new.raw_user_meta_data ->> 'food_photos_policy_version','2026-11-11'));

    if new.raw_user_meta_data ->> 'progress_photos_consent' = 'true' then
      insert into public.account_consent_events(user_id,consent_type,action,policy_version)
        values(new.id,'progress_photos','granted',coalesce(new.raw_user_meta_data ->> 'photos_policy_version','current'));
    end if;
    insert into public.account_notification_preferences(user_id,workout_reminders,progress_photo_reminders,product_news)
      values(new.id,
        coalesce((new.raw_user_meta_data ->> 'workout_reminders')::boolean,false),
        coalesce((new.raw_user_meta_data ->> 'progress_photo_reminders')::boolean,false),
        coalesce((new.raw_user_meta_data ->> 'product_news')::boolean,false));
  else
    update public.profiles
      set email = lower(new.email),
          email_verified_at = new.email_confirmed_at,
          updated_at = now()
      where id = new.id;
  end if;
  return new;
end;
$function$;

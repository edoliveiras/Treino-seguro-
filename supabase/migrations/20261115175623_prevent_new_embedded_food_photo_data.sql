-- Block new base64 image payloads in health records until the app uses private Storage.
-- An unchanged legacy image is preserved so unrelated health-data edits do not destroy it.
create or replace function public.prevent_new_embedded_food_photo_data()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $function$
begin
  if coalesce(jsonb_typeof(new.payload->'foodLogs'), '') <> 'array' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if exists (
      select 1
      from jsonb_array_elements(new.payload->'foodLogs') as new_log(value)
      where lower(coalesce(new_log.value->>'photo', '')) like 'data:image/%'
    ) then
      raise exception 'food_photo_private_storage_required'
        using errcode = '42501';
    end if;
  else
    if exists (
      select 1
      from jsonb_array_elements(new.payload->'foodLogs') as new_log(value)
      where lower(coalesce(new_log.value->>'photo', '')) like 'data:image/%'
        and not exists (
          select 1
          from jsonb_array_elements(
            case
              when jsonb_typeof(old.payload->'foodLogs') = 'array'
                then old.payload->'foodLogs'
              else '[]'::jsonb
            end
          ) as old_log(value)
          where old_log.value->>'id' = new_log.value->>'id'
            and old_log.value->>'photo' = new_log.value->>'photo'
        )
    ) then
      raise exception 'food_photo_private_storage_required'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists prevent_new_embedded_food_photo_data on public.health_data_records;
create trigger prevent_new_embedded_food_photo_data
before insert or update of payload on public.health_data_records
for each row
execute function public.prevent_new_embedded_food_photo_data();

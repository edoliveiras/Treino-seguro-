-- Storage RLS tests run after account_security.test.sql creates the auth/profile stubs.
create schema if not exists storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key,
  bucket_id text not null references storage.buckets(id),
  name text not null,
  owner_id text,
  created_at timestamptz not null default now()
);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text)
returns text[]
language sql immutable
as $$ select regexp_split_to_array(name, '/') $$;
grant usage on schema storage to anon, authenticated, service_role;
grant execute on function storage.foldername(text) to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.buckets to authenticated;
grant all on storage.objects, storage.buckets to service_role;

\ir ../migrations/20261111214532_private_food_photo_storage.sql
\ir ../migrations/20261111214904_record_optional_food_photo_consent.sql
\ir ../migrations/20261111215333_require_both_consents_for_food_photos.sql
\ir ../migrations/20261111220005_require_active_account_for_food_photo_updates.sql

insert into public.account_consent_events(user_id,consent_type,action,policy_version)
values
('00000000-0000-4000-8000-000000000001','food_photos','granted','photo-v1'),
('00000000-0000-4000-8000-000000000003','food_photos','granted','photo-v1'),
('00000000-0000-4000-8000-000000000001','health_data','granted','health-v1'),
('00000000-0000-4000-8000-000000000003','health_data','granted','health-v1');

do $bucket_check$
begin
  if (select public from storage.buckets where id='food-photos') is distinct from false then
    raise exception 'food_photo_bucket_must_be_private';
  end if;
  if (select file_size_limit from storage.buckets where id='food-photos') <> 5242880 then
    raise exception 'food_photo_bucket_limit_must_be_5mb';
  end if;
end;
$bucket_check$;

insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000006','adult6@example.test',now(),
 '{"full_name":"Pessoa Teste 6","phone_e164":"+5511999990006","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true","health_data_consent":"false","food_photos_consent":"true"}');
do $signup_photo_consent$
begin
  if (select action from public.account_consent_events where user_id='00000000-0000-4000-8000-000000000006' and consent_type='health_data' order by occurred_at desc limit 1) <> 'declined' then raise exception 'health_data_decline_not_recorded'; end if;
  if (select action from public.account_consent_events where user_id='00000000-0000-4000-8000-000000000006' and consent_type='food_photos' order by occurred_at desc limit 1) <> 'granted' then raise exception 'food_photo_consent_not_recorded'; end if;
end;
$signup_photo_consent$;

insert into storage.objects(id,bucket_id,name,owner_id)
values
('30000000-0000-4000-8000-000000000001','food-photos','00000000-0000-4000-8000-000000000001/a.jpg','00000000-0000-4000-8000-000000000001'),
('30000000-0000-4000-8000-000000000002','food-photos','00000000-0000-4000-8000-000000000003/b.jpg','00000000-0000-4000-8000-000000000003');

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"}}';
do $photo_user_a$
declare v_denied boolean := false;
begin
  if (select count(*) from storage.objects) <> 1 then
    raise exception 'user_a_can_read_another_users_food_photo';
  end if;
  begin
    insert into storage.objects(id,bucket_id,name,owner_id)
    values ('30000000-0000-4000-8000-000000000003','food-photos','00000000-0000-4000-8000-000000000003/forbidden.jpg','00000000-0000-4000-8000-000000000001');
  exception when insufficient_privilege then v_denied := true;
  end;
  if not v_denied then raise exception 'user_a_uploaded_into_user_b_folder'; end if;
end;
$photo_user_a$;
reset role;

set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"role":"user"}}';
do $photo_user_b$
begin
  if (select count(*) from storage.objects) <> 1 then
    raise exception 'user_b_can_read_another_users_food_photo';
  end if;
  delete from storage.objects where name='00000000-0000-4000-8000-000000000001/a.jpg';
end;
$photo_user_b$;
reset role;

-- After withdrawal, reads are blocked immediately and the owner can still delete.
insert into public.account_consent_events(user_id,consent_type,action,policy_version)
values ('00000000-0000-4000-8000-000000000001','food_photos','withdrawn','photo-v1'),
('00000000-0000-4000-8000-000000000001','health_data','withdrawn','health-v1');
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"}}';
do $photo_revoke$
declare v_rows integer;
begin
  if (select count(*) from storage.objects) <> 0 then
    raise exception 'revoked_photo_consent_still_allows_read';
  end if;
  delete from storage.objects where name='00000000-0000-4000-8000-000000000001/a.jpg';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'client_deleted_after_revocation_instead_of_server_cleanup'; end if;
end;
$photo_revoke$;
reset role;

-- The authenticated Edge Function uses its server-side storage client to finish cleanup.
delete from storage.objects where name='00000000-0000-4000-8000-000000000001/a.jpg';

do $photo_deleted$
begin
  if exists (select 1 from storage.objects where name='00000000-0000-4000-8000-000000000001/a.jpg') then
    raise exception 'photo_not_deleted_after_owner_cleanup';
  end if;
  if not exists (select 1 from storage.objects where name='00000000-0000-4000-8000-000000000003/b.jpg') then
    raise exception 'user_b_photo_was_deleted_by_user_a';
  end if;
end;
$photo_deleted$;

-- Exercise the same storage-first cleanup order used by the account deletion Edge Function.
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000007','adult7@example.test',now(),
 '{"full_name":"Pessoa Teste 7","phone_e164":"+5511999990007","adult_confirmed":"true","terms_accepted":"true","privacy_accepted":"true","health_data_consent":"true","food_photos_consent":"true"}');
insert into public.health_data_records(user_id,payload)
values ('00000000-0000-4000-8000-000000000007','{"weight":"70","foodLogs":[]}');
insert into storage.objects(id,bucket_id,name,owner_id)
values ('30000000-0000-4000-8000-000000000007','food-photos','00000000-0000-4000-8000-000000000007/c.jpg','00000000-0000-4000-8000-000000000007');
delete from storage.objects where name like '00000000-0000-4000-8000-000000000007/%';
delete from auth.users where id='00000000-0000-4000-8000-000000000007';
do $account_delete_cascade$
begin
  if exists(select 1 from public.profiles where id='00000000-0000-4000-8000-000000000007') then raise exception 'account_delete_left_profile'; end if;
  if exists(select 1 from public.health_data_records where user_id='00000000-0000-4000-8000-000000000007') then raise exception 'account_delete_left_health_records'; end if;
  if exists(select 1 from public.account_consent_events where user_id='00000000-0000-4000-8000-000000000007') then raise exception 'account_delete_left_consents'; end if;
  if exists(select 1 from public.account_notification_preferences where user_id='00000000-0000-4000-8000-000000000007') then raise exception 'account_delete_left_notification_preferences'; end if;
  if exists(select 1 from storage.objects where name like '00000000-0000-4000-8000-000000000007/%') then raise exception 'account_delete_left_storage_objects'; end if;
end;
$account_delete_cascade$;

select 'private_food_photo_storage_rls_tests_passed' as result;

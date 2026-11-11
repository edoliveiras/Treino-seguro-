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

\ir ../migrations/20261111190000_private_food_photo_storage.sql
\ir ../migrations/20261111191000_record_optional_food_photo_consent.sql

insert into public.account_consent_events(user_id,consent_type,action,policy_version)
values
('00000000-0000-4000-8000-000000000001','food_photos','granted','photo-v1'),
('00000000-0000-4000-8000-000000000003','food_photos','granted','photo-v1');

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

set role service_role;
insert into storage.objects(id,bucket_id,name,owner_id)
values
('30000000-0000-4000-8000-000000000001','food-photos','00000000-0000-4000-8000-000000000001/a.jpg','00000000-0000-4000-8000-000000000001'),
('30000000-0000-4000-8000-000000000002','food-photos','00000000-0000-4000-8000-000000000003/b.jpg','00000000-0000-4000-8000-000000000003');
reset role;

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
values ('00000000-0000-4000-8000-000000000001','food_photos','withdrawn','photo-v1');
set role authenticated;
set request.jwt.claim.role = 'authenticated';
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"}}';
do $photo_revoke$
begin
  if (select count(*) from storage.objects) <> 0 then
    raise exception 'revoked_photo_consent_still_allows_read';
  end if;
  delete from storage.objects where name='00000000-0000-4000-8000-000000000001/a.jpg';
end;
$photo_revoke$;
reset role;

set role service_role;
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
reset role;

select 'private_food_photo_storage_rls_tests_passed' as result;

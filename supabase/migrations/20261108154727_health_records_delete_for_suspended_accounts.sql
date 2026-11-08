-- Allow account owners to delete their own health data even while suspended.
drop policy if exists health_records_delete_own on public.health_data_records;
create policy health_records_delete_own
on public.health_data_records for delete to authenticated
using (user_id = (select auth.uid()));

-- Explicitly document deny-all direct browser access for private operational tables.
-- Edge Functions use service_role, which bypasses RLS; browser roles remain denied.
drop policy if exists otp_challenges_deny_client_access on public.phone_otp_challenges;
create policy otp_challenges_deny_client_access
  on public.phone_otp_challenges for all to anon, authenticated
  using (false) with check (false);

drop policy if exists otp_send_log_deny_client_access on public.phone_otp_send_log;
create policy otp_send_log_deny_client_access
  on public.phone_otp_send_log for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_audit_deny_client_access on public.account_admin_audit;
create policy admin_audit_deny_client_access
  on public.account_admin_audit for all to anon, authenticated
  using (false) with check (false);

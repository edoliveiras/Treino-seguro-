-- Prevent direct RPC invocation of the auth.users synchronization trigger.
-- The function is only intended to run from its trigger.
revoke all on function public.sync_auth_account_profile() from public, anon, authenticated;

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (request.headers.get("origin") !== allowedOrigin) return json(403, { error: "origin_not_allowed" });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json(401, { error: "authentication_required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json(503, { error: "service_unavailable" });

  let body: { confirm?: unknown };
  try { body = await request.json(); } catch { return json(400, { error: "invalid_request" }); }
  if (body.confirm !== true) return json(400, { error: "confirmation_required" });

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = authorization.slice(7);
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json(401, { error: "authentication_required" });

  const { data: profile, error: profileError } = await userClient.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profileError || !profile) return json(403, { error: "account_not_available" });
  if (profile.role === "admin") return json(403, { error: "administrator_must_use_admin_account_removal" });

  // Remove owned objects first: Supabase Auth refuses deletion while the user owns Storage objects.
  for (;;) {
    const { data: objects, error: listError } = await adminClient.storage.from("food-photos").list(authData.user.id, { limit: 1000, offset: 0 });
    if (listError) return json(503, { error: "photo_cleanup_failed_account_not_deleted" });
    if (!objects?.length) break;
    const paths = objects.filter((item) => item.id).map((item) => `${authData.user.id}/${item.name}`);
    if (paths.length) {
      const { error: removeError } = await adminClient.storage.from("food-photos").remove(paths);
      if (removeError) return json(503, { error: "photo_cleanup_failed_account_not_deleted" });
    }
    if (objects.length < 1000) break;
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id);
  if (deleteError) return json(409, { error: "account_delete_not_completed" });
  return json(200, { success: true });
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { deleteUserFoodPhotos } from "../shared/photoCleanup.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  const origin = request.headers.get("origin");
  if (origin !== (Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app")) return json(403, { error: "origin_not_allowed" });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json(401, { error: "authentication_required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json(503, { error: "service_unavailable" });

  const token = authorization.slice(7);
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json(401, { error: "authentication_required" });

  let body: { action?: unknown };
  try { body = await request.json(); } catch { return json(400, { error: "invalid_request" }); }
  if (body.action !== "grant" && body.action !== "revoke") return json(400, { error: "invalid_request" });

  const userId = authData.user.id;
  if (body.action === "grant") {
    // A new grant must never make old, incompletely removed files visible again.
    try { await deleteUserFoodPhotos(adminClient.storage, userId); }
    catch { return json(503, { error: "previous_photo_cleanup_failed_consent_not_granted" }); }
    const { error: consentError } = await userClient.from("account_consent_events").insert({
      user_id: userId, consent_type: "food_photos", action: "granted", policy_version: "2026-11-11",
    });
    if (consentError) return json(400, { error: "consent_not_recorded" });
    return json(200, { success: true, consent: "granted" });
  }

  const { data: latestConsent } = await userClient.from("account_consent_events")
    .select("action").eq("user_id", userId).eq("consent_type", "food_photos")
    .order("occurred_at", { ascending: false }).limit(1);
  if (latestConsent?.[0]?.action !== "withdrawn") {
    const { error: consentError } = await userClient.from("account_consent_events").insert({
      user_id: userId, consent_type: "food_photos", action: "withdrawn", policy_version: "2026-11-11",
    });
    if (consentError) return json(400, { error: "consent_not_recorded" });
  }
  try {
    const deleted = await deleteUserFoodPhotos(adminClient.storage, userId);
    return json(200, { success: true, consent: "withdrawn", revoked: true, deleted });
  } catch {
    return json(200, { success: false, consent: "withdrawn", revoked: true, cleanupPending: true });
  }
});

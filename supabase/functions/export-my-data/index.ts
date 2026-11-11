import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.80.0";

const allowedOrigin = Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app";
const headers = { "Access-Control-Allow-Origin": allowedOrigin, "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (request.headers.get("origin") !== allowedOrigin) return json(403, { error: "origin_not_allowed" });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json(401, { error: "authentication_required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json(503, { error: "service_unavailable" });
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = authorization.slice(7);
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json(401, { error: "authentication_required" });

  const userId = authData.user.id;
  const [profile, consents, health, assignments, completions, preferences] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", userId).maybeSingle(),
    adminClient.from("account_consent_events").select("*").eq("user_id", userId).order("occurred_at"),
    adminClient.from("health_data_records").select("*").eq("user_id", userId).maybeSingle(),
    adminClient.from("workout_assignments").select("*").eq("student_id", userId),
    adminClient.from("workout_completions").select("*").eq("student_id", userId),
    adminClient.from("account_notification_preferences").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  const errors = [profile.error, consents.error, health.error, assignments.error, completions.error, preferences.error].filter(Boolean);
  if (errors.length) return json(500, { error: "export_not_completed" });
  const planIds = [...new Set((assignments.data ?? []).map((item) => item.plan_id))];
  const [plans, exercises] = planIds.length ? await Promise.all([
    adminClient.from("workout_plans").select("*").in("id", planIds),
    adminClient.from("workout_plan_exercises").select("*").in("plan_id", planIds),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  if (plans.error || exercises.error) return json(500, { error: "export_not_completed" });

  const latestConsent = new Map<string, string>();
  for (const event of consents.data ?? []) latestConsent.set(event.consent_type, event.action);
  const photoConsentActive = latestConsent.get("food_photos") === "granted" && latestConsent.get("health_data") === "granted";
  const payload = (health.data?.payload ?? {}) as { foodLogs?: Array<{ photoPath?: unknown }> };
  const photoPaths = photoConsentActive && Array.isArray(payload.foodLogs)
    ? [...new Set(payload.foodLogs.map((item) => typeof item.photoPath === "string" ? item.photoPath : null).filter((path): path is string => Boolean(path && path.startsWith(`${userId}/`))))]
    : [];
  const signedAttachments = await Promise.all(photoPaths.map(async (path) => {
    const { data, error } = await adminClient.storage.from("food-photos").createSignedUrl(path, 300);
    return !error && data?.signedUrl ? { path, downloadUrl: data.signedUrl, expiresInSeconds: 300 } : null;
  }));
  const foodPhotoAttachments = signedAttachments.filter((item): item is { path: string; downloadUrl: string; expiresInSeconds: number } => item !== null);

  return json(200, {
    exportedAt: new Date().toISOString(),
    account: profile.data,
    consents: consents.data,
    healthRecords: health.data,
    workoutAssignments: assignments.data,
    workoutCompletions: completions.data,
    workoutPlans: plans.data,
    workoutPlanExercises: exercises.data,
    notificationPreferences: preferences.data,
    foodPhotoAttachments,
  });
});

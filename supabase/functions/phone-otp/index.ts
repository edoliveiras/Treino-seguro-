import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function makeCode(): string {
  const limit = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return String(value % 1_000_000).padStart(6, "0");
}

async function hmacCode(code: string): Promise<string> {
  const secret = Deno.env.get("OTP_HMAC_SECRET");
  if (!secret || secret.length < 32) throw new Error("server_not_configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(code));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sendTwilioSms(phoneE164: string, code: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("sms_fallback_not_configured");
  }

  const credentials = btoa(`${accountSid}:${authToken}`);
  const form = new URLSearchParams({
    To: phoneE164,
    MessagingServiceSid: messagingServiceSid,
    Body: `Seu código de confirmação do Treino Seguro é ${code}. Ele expira em 10 minutos. Não compartilhe este código.`,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!response.ok) throw new Error("sms_delivery_failed");
}

async function sendMetaWhatsApp(phoneE164: string, code: string): Promise<void> {
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const apiVersion = Deno.env.get("WHATSAPP_API_VERSION");
  const templateName = Deno.env.get("WHATSAPP_OTP_TEMPLATE_NAME");
  const language = Deno.env.get("WHATSAPP_OTP_TEMPLATE_LANGUAGE") ?? "pt_BR";
  if (!token || !phoneNumberId || !apiVersion || !templateName) {
    throw new Error("provider_not_configured");
  }

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneE164.replace("+", ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    // Não registrar corpo da resposta: pode conter dados pessoais do destinatário.
    throw new Error("provider_delivery_failed");
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  const origin = request.headers.get("origin");
  const allowedOrigin = Deno.env.get("APP_ORIGIN");
  if (!allowedOrigin) return json(503, { error: "service_not_configured" });
  if (origin !== allowedOrigin) return json(403, { error: "origin_not_allowed" });

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json(401, { error: "authentication_required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json(503, { error: "service_unavailable" });

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authorization.slice("Bearer ".length);
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData.user;
  if (userError || !user || !user.email_confirmed_at) {
    return json(401, { error: "authentication_required" });
  }

  let body: { action?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }

  if (body.action === "send") {
    try {
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("whatsapp_e164, account_status")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError || !profile || profile.account_status === "suspended") {
        return json(200, { ok: true, message: "Se a solicitação puder ser atendida, você receberá as instruções." });
      }

      const code = makeCode();
      const digest = await hmacCode(code);
      const { data: challengeId, error: challengeError } = await adminClient.rpc(
        "create_phone_otp_challenge",
        { p_user_id: user.id, p_code_hmac: digest },
      );
      if (challengeError || !challengeId) {
        return json(200, { ok: true, message: "Se a solicitação puder ser atendida, você receberá as instruções." });
      }

      let deliveredBy: "meta_whatsapp" | "twilio_sms";
      try {
        await sendMetaWhatsApp(profile.whatsapp_e164, code);
        deliveredBy = "meta_whatsapp";
      } catch {
        try {
          await sendTwilioSms(profile.whatsapp_e164, code);
          deliveredBy = "twilio_sms";
        } catch {
          await adminClient.rpc("record_phone_otp_delivery", {
            p_challenge_id: challengeId,
            p_outcome: "failed",
            p_provider: "twilio_sms",
          });
          return json(503, { error: "delivery_unavailable", message: "Não foi possível enviar agora. Tente mais tarde." });
        }
      }

      const { error: deliveryError } = await adminClient.rpc("record_phone_otp_delivery", {
        p_challenge_id: challengeId,
        p_outcome: "sent",
        p_provider: deliveredBy,
      });
      if (deliveryError) return json(503, { error: "service_unavailable" });
      return json(200, {
        ok: true,
        channel: deliveredBy === "meta_whatsapp" ? "whatsapp" : "sms",
        message: deliveredBy === "meta_whatsapp" ? "Código enviado pelo WhatsApp." : "WhatsApp indisponível; código enviado por SMS.",
      });
    } catch {
      return json(503, { error: "service_unavailable" });
    }
  }

  if (body.action === "verify") {
    if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
      return json(400, { error: "invalid_code", message: "Informe o código de 6 dígitos." });
    }
    try {
      const digest = await hmacCode(body.code);
      const { data: verified, error } = await adminClient.rpc("verify_phone_otp_challenge", {
        p_user_id: user.id,
        p_code_hmac: digest,
      });
      if (error || verified !== true) {
        return json(400, { error: "verification_failed", message: "Código inválido ou expirado. Solicite outro código se necessário." });
      }
      return json(200, { ok: true, message: "WhatsApp confirmado." });
    } catch {
      return json(503, { error: "service_unavailable" });
    }
  }

  return json(400, { error: "invalid_request" });
});

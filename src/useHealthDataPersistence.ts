import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type HealthPayload = Record<string, unknown>;

export function useHealthDataPersistence(
  userId: string | undefined,
  payload: HealthPayload,
  onLoad: (payload: HealthPayload) => void,
) {
  const [consent, setConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      setConsent(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const { data: events, error: consentError } = await supabase
        .from("account_consent_events")
        .select("action")
        .eq("user_id", userId)
        .eq("consent_type", "health_data")
        .order("occurred_at", { ascending: false })
        .limit(1);
      if (consentError) {
        if (active) setStatus("Não foi possível verificar sua autorização de dados de saúde.");
        if (active) setLoading(false);
        return;
      }
      const { data: photoEvents, error: photoConsentError } = await supabase
        .from("account_consent_events")
        .select("action")
        .eq("user_id", userId)
        .eq("consent_type", "food_photos")
        .order("occurred_at", { ascending: false })
        .limit(1);
      const granted = events?.[0]?.action === "granted";
      if (!active) return;
      setConsent(granted);
      setPhotoConsent(!photoConsentError && photoEvents?.[0]?.action === "granted");
      if (granted) {
        const { data, error } = await supabase
          .from("health_data_records")
          .select("payload")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) {
          if (active) setStatus("Não foi possível carregar seus registros salvos.");
        } else if (active && data?.payload && typeof data.payload === "object") {
          onLoad(data.payload as HealthPayload);
          setStatus("Seus registros salvos foram carregados.");
        }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, onLoad]);

  useEffect(() => {
    const client = supabase;
    if (!userId || !client || !consent || loading) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const { error } = await client
        .from("health_data_records")
        .upsert({ user_id: userId, payload }, { onConflict: "user_id" });
      if (!active) return;
      setStatus(error ? "Não foi possível salvar agora. Verifique sua conexão." : "Registros salvos com segurança na sua conta.");
    }, 650);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [userId, consent, loading, payload]);

  const grantConsent = useCallback(async () => {
    const client = supabase;
    if (!userId || !client) return false;
    const { error } = await client.from("account_consent_events").insert({
      user_id: userId,
      consent_type: "health_data",
      action: "granted",
      policy_version: "2026-11-08",
    });
    if (error) {
      setStatus("Não foi possível registrar sua autorização. Tente novamente.");
      return false;
    }
    const { data, error: loadError } = await client
      .from("health_data_records")
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle();
    if (loadError) {
      setStatus("A autorização foi registrada, mas não foi possível carregar registros anteriores.");
      return false;
    }
    if (data?.payload && typeof data.payload === "object") onLoad(data.payload as HealthPayload);
    setConsent(true);
    setStatus("Autorização registrada. Seus registros serão sincronizados.");
    return true;
  }, [userId, onLoad]);

  const revokeConsent = useCallback(async () => {
    const client = supabase;
    if (!userId || !client) return false;
    let photoCleanupPending = false;
    if (photoConsent) {
      const { data, error: photoError } = await client.functions.invoke("food-photo-consent", { body: { action: "revoke" } });
      if (data?.revoked || data?.consent === "withdrawn") setPhotoConsent(false);
      photoCleanupPending = Boolean(photoError || !data?.success);
    }
    const { error } = await client.from("account_consent_events").insert({
      user_id: userId,
      consent_type: "health_data",
      action: "withdrawn",
      policy_version: "2026-11-11",
    });
    if (error) {
      setStatus("Não foi possível registrar a revogação. Tente novamente.");
      return false;
    }
    setConsent(false);
    setStatus(photoCleanupPending
      ? "Autorização de saúde revogada. O acesso às fotos foi bloqueado; a exclusão física de algumas fotos ainda precisa ser concluída."
      : "Autorização de saúde revogada. Novos registros não serão sincronizados e as fotos enviadas também foram removidas.");
    return true;
  }, [userId, photoConsent]);

  const grantPhotoConsent = useCallback(async () => {
    const client = supabase;
    if (!userId || !client) return false;
    const { data, error } = await client.functions.invoke("food-photo-consent", { body: { action: "grant" } });
    if (error || !data?.success) {
      setStatus("Não foi possível registrar a autorização para fotos. Tente novamente.");
      return false;
    }
    setPhotoConsent(true);
    setStatus("Autorização específica para fotos registrada.");
    return true;
  }, [userId]);

  const revokePhotoConsent = useCallback(async () => {
    const client = supabase;
    if (!userId || !client) return false;
    const { data, error } = await client.functions.invoke("food-photo-consent", { body: { action: "revoke" } });
    if (data?.revoked || data?.consent === "withdrawn") setPhotoConsent(false);
    if (error || !data?.success) {
      setStatus(data?.revoked
        ? "Autorização revogada. A limpeza das fotos ainda precisa ser concluída; tente novamente."
        : "Não foi possível concluir a revogação. Nenhuma alteração foi confirmada.");
      return false;
    }
    setPhotoConsent(false);
    setStatus("Autorização revogada e fotos enviadas apagadas do armazenamento privado.");
    return true;
  }, [userId]);

  const deleteCloudData = useCallback(async () => {
    const client = supabase;
    if (!userId || !client) return false;
    const { error: consentError } = await client.from("account_consent_events").insert({
      user_id: userId,
      consent_type: "health_data",
      action: "withdrawn",
      policy_version: "2026-11-08",
    });
    if (consentError) {
      setStatus("Não foi possível pausar a sincronização. Os registros não foram apagados.");
      return false;
    }
    setConsent(false);
    const { error } = await client.from("health_data_records").delete().eq("user_id", userId);
    if (error) {
      setStatus("A autorização foi retirada, mas não foi possível apagar os registros. Tente novamente.");
      return false;
    }
    setStatus("Os registros salvos foram apagados e a autorização foi retirada.");
    return true;
  }, [userId]);

  return { consent, photoConsent, loading, status, grantConsent, revokeConsent, grantPhotoConsent, revokePhotoConsent, deleteCloudData };
}

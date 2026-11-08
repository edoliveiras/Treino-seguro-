import { createClient } from "@supabase/supabase-js";

// Chave publishable: foi criada para uso no navegador. A proteção dos dados
// depende das políticas RLS do banco; nenhuma chave secreta fica neste arquivo.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://oehwfnrwqyvpwhmtbcwi.supabase.co";
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "sb_publishable_7lTfaAfMQvrrWq8LQubIPA_Xl1RORiX";

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

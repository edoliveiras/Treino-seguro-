import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import App from "./App";
import LegalPage from "./LegalPage";
import { supabase, supabaseConfigured } from "./lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  whatsapp_e164: string;
  email_verified_at: string | null;
  account_status: "pending_verification" | "active" | "suspended";
};

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return "+" + digits;
  return "+55" + digits;
};

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "recovery">("login");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [photoReminders, setPhotoReminders] = useState(false);
  const [news, setNews] = useState(false);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id,full_name,email,whatsapp_e164,email_verified_at,account_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      setError("Não foi possível conferir os dados da conta. Tente entrar novamente.");
      setProfile(null);
      return;
    }
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase!.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await loadProfile(data.session?.user ?? null);
      if (alive) setLoading(false);
    });
    const { data: listener } = supabase!.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
      setSession(nextSession);
      window.setTimeout(() => {
        if (alive) void loadProfile(nextSession?.user ?? null);
      }, 0);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("flow") === "recovery" || window.location.hash.includes("type=recovery") || (params.has("code") && window.location.pathname === "/redefinir-senha")) setMode("recovery");
    else if (params.get("mode") === "signup") setMode("signup");
  }, []);

  if (window.location.pathname === "/termos") return <LegalPage kind="terms" />;
  if (window.location.pathname === "/privacidade") return <LegalPage kind="privacy" />;

  const run = async (event: FormEvent, action: () => Promise<void>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      setError(message || "Não foi possível concluir. Confira os dados e tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const signUp = async () => {
    if (!supabase) return;
    if (!adult || !terms || !privacy) throw new Error("Confirme que tem 18 anos ou mais e aceite os Termos e a Política de Privacidade.");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    if (!/^\+55[1-9][0-9]{9,10}$/.test(normalizedPhone)) throw new Error("Informe um telefone brasileiro com DDD e número válido.");
    if (password.length < 10) throw new Error("Use uma senha com pelo menos 10 caracteres.");
    const { error: signupError } = await supabase!.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName.trim(),
          whatsapp_e164: normalizedPhone,
          adult_confirmed: "true",
          terms_accepted: "true",
          privacy_accepted: "true",
          terms_version: "2026-11-08",
          privacy_version: "2026-11-08",
          health_data_consent: healthConsent ? "true" : "false",
          progress_photos_consent: photoConsent ? "true" : "false",
          workout_reminders: workoutReminders,
          progress_photo_reminders: photoReminders,
          product_news: news,
        },
      },
    });
    if (signupError) throw signupError;
    setMode("login");
    setNotice("Cadastro iniciado. Confirme o link enviado ao seu e-mail para liberar o acesso. O telefone informado fica apenas como contato; não enviaremos mensagens.");
  };

  const signIn = async () => {
    if (!supabase) return;
    const { error: loginError } = await supabase!.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (loginError) throw loginError;
  };

  const sendRecovery = async () => {
    if (!supabase) return;
    const { error: recoveryError } = await supabase!.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin + "/?flow=recovery" });
    if (recoveryError) throw recoveryError;
    setNotice("Se houver uma conta para esse e-mail, enviaremos um link de recuperação.");
  };

  const resendConfirmation = async () => {
    if (!supabase) return;
    const { error: resendError } = await supabase!.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } });
    if (resendError) throw resendError;
    setNotice("Se a confirmação ainda estiver pendente, enviaremos um novo link para o e-mail informado.");
  };

  const updatePassword = async () => {
    if (!supabase) return;
    if (newPassword.length < 10) throw new Error("Use uma senha com pelo menos 10 caracteres.");
    const { error: updateError } = await supabase!.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
    setMode("login");
    setNotice("Senha atualizada. Entre novamente.");
    await supabase!.auth.signOut();
  };

  if (!supabaseConfigured || !supabase) return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><h1>Estamos preparando seu acesso</h1><p>O aplicativo ainda precisa da configuração segura de conexão para liberar cadastro e login. Nenhum dado pessoal será solicitado nesta etapa.</p></section></main>;
  if (loading) return <main className="auth-shell"><section className="auth-card"><h1>Treino Seguro</h1><p>Verificando seu acesso com segurança…</p></section></main>;

  if (session && profile?.account_status === "suspended") return <main className="auth-shell"><section className="auth-card"><h1>Conta temporariamente suspensa</h1><p>O acesso está bloqueado. Entre em contato com o suporte para receber orientação.</p><button className="auth-button secondary" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;

  if (session && profile?.email_verified_at && profile.account_status === "active") return <><div className="account-bar"><span>Olá, {profile.full_name}</span><button onClick={() => void supabase!.auth.signOut()}>Sair da conta</button></div><App /></>;

  if (session && !profile) return <main className="auth-shell"><section className="auth-card"><h1>Conferindo cadastro</h1><p>Não foi possível carregar o perfil cadastral. Atualize a página ou tente entrar novamente.</p><button className="auth-button secondary" onClick={() => void loadProfile(session.user)}>Tentar novamente</button><button className="auth-link" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;

  if (session && profile) return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><h1>Confirme seu e-mail</h1><p className="auth-muted">Por segurança, o acesso ao aplicativo é liberado após a confirmação do endereço de e-mail. O WhatsApp informado no cadastro é somente um contato; não fazemos integração nem enviamos mensagens.</p><div className="verification-row"><b>E-mail</b><span>{profile.email_verified_at ? "Confirmado" : "Aguardando confirmação"}</span></div>{!profile.email_verified_at ? <p>Abra o link enviado ao seu e-mail. Depois volte e entre novamente.</p> : <><p>Seu e-mail foi confirmado. Estamos atualizando o acesso da sua conta.</p><button className="auth-button secondary" onClick={() => void loadProfile(session.user)}>Atualizar acesso</button></>}{error&&<p className="auth-error">{error}</p>}{notice&&<p className="auth-success">{notice}</p>}<button className="auth-link" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;

  const title = mode === "signup" ? "Criar sua conta" : mode === "forgot" ? "Recuperar acesso" : mode === "recovery" ? "Criar nova senha" : "Entre na sua conta";
  return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><span className="auth-eyebrow">SAÚDE EM MOVIMENTO</span><h1>{title}</h1><p className="auth-muted">Um espaço de orientação para adultos, com cuidado e respeito ao seu ritmo.</p>
    {mode === "signup" ? <form onSubmit={(e)=>void run(e,signUp)}><label>Nome completo<input autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} required minLength={2}/></label><label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Telefone para contato (WhatsApp, sem envio de mensagens)<input type="tel" autoComplete="tel" placeholder="31 99999-9999" value={phone} onChange={e=>setPhone(e.target.value)} required/></label><label>Senha (mínimo de 10 caracteres)<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} required/></label>
      <div className="auth-consents"><label><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/> Confirmo que tenho 18 anos ou mais.</label><label><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> Aceito os <a href="/termos" target="_blank" rel="noreferrer">Termos de Uso</a>.</label><label><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/> Li e aceito a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label><hr/><p>Autorizações opcionais — você pode continuar sem marcar:</p><label><input type="checkbox" checked={healthConsent} onChange={e=>setHealthConsent(e.target.checked)}/> Autorizo o tratamento de dados de saúde para as funções que dependem deles.</label><label><input type="checkbox" checked={photoConsent} onChange={e=>setPhotoConsent(e.target.checked)}/> Autorizo o uso de fotos de evolução, se eu decidir enviá-las.</label><hr/><p>Notificações opcionais, desligadas por padrão:</p><label><input type="checkbox" checked={workoutReminders} onChange={e=>setWorkoutReminders(e.target.checked)}/> Lembretes de treino.</label><label><input type="checkbox" checked={photoReminders} onChange={e=>setPhotoReminders(e.target.checked)}/> Lembrete de foto a cada 3 semanas.</label><label><input type="checkbox" checked={news} onChange={e=>setNews(e.target.checked)}/> Novidades do aplicativo.</label></div><button className="auth-button" disabled={busy}>{busy?"Aguarde…":"Criar conta"}</button></form> : mode === "recovery" ? <form onSubmit={(e)=>void run(e,updatePassword)}><label>Nova senha<input type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={10} required/></label><button className="auth-button" disabled={busy}>Salvar nova senha</button></form> : <form onSubmit={(e)=>void run(e,mode==="forgot"?sendRecovery:signIn)}><label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>{mode!=="forgot"&&<label>Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>}<button className="auth-button" disabled={busy}>{busy?"Aguarde…":mode==="forgot"?"Enviar link de recuperação":"Entrar"}</button></form>}
    {error&&<p className="auth-error" role="alert">{error}</p>}{notice&&<p className="auth-success" role="status">{notice}</p>}<div className="auth-switch">{mode==="login"?<><button onClick={()=>{setMode("signup");setError("");setNotice("");}}>Criar uma conta</button><button onClick={()=>{setMode("forgot");setError("");setNotice("");}}>Esqueci minha senha</button><button onClick={(e)=>void run(e,resendConfirmation)}>Reenviar confirmação de e-mail</button></>:<button onClick={()=>{setMode("login");setError("");setNotice("");}}>Voltar para entrar</button>}</div></section></main>;
}

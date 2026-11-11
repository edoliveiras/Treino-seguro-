import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import App from "./App";
import AdminPanel from "./AdminPanel";
import LegalPage from "./LegalPage";
import { supabase, supabaseConfigured } from "./lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone_e164: string;
  email_verified_at: string | null;
  account_status: "pending_verification" | "active" | "suspended";
  training_level: "Iniciante" | "Intermediário" | "Avançado";
  training_place: "Casa" | "Academia";
  training_days: number;
};

const PRODUCTION_ORIGIN = "https://treino-seguro.vercel.app";

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return "+" + digits;
  return "+55" + digits;
};

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
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
  const [foodPhotoConsent, setFoodPhotoConsent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [loginFailures, setLoginFailures] = useState(0);
  const [loginCooldown, setLoginCooldown] = useState(0);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");

  const loadProfile = useCallback(async (user: User | null) => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id,full_name,email,phone_e164,email_verified_at,account_status,training_level,training_place,training_days")
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
    (async () => {
      const { data: initial } = await supabase!.auth.getSession();
      let nextSession = initial.session;
      if (nextSession) {
        const { data: refreshed } = await supabase!.auth.refreshSession();
        nextSession = refreshed.session ?? nextSession;
      }
      if (!alive) return;
      setSession(nextSession);
      await loadProfile(nextSession?.user ?? null);
      if (alive) setLoading(false);
    })();
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
    if (emailCooldown <= 0 && loginCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setEmailCooldown(value => Math.max(0, value - 1));
      setLoginCooldown(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailCooldown, loginCooldown]);

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
      const normalized = message.toLowerCase();
      if (normalized.includes("invalid login credentials")) setError("E-mail ou senha incorretos.");
      else if (normalized.includes("email not confirmed")) setError("Confirme seu e-mail antes de entrar.");
      else if (normalized.includes("rate limit") || normalized.includes("too many requests")) setError("Muitas tentativas. Aguarde um pouco e tente novamente.");
      else setError(message || "Não foi possível concluir. Confira os dados e tente novamente.");
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
    if (password.length < 8) throw new Error("Use uma senha com pelo menos 8 caracteres.");
    const { error: signupError } = await supabase!.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: PRODUCTION_ORIGIN,
        data: {
          full_name: fullName.trim(),
          phone_e164: normalizedPhone,
          adult_confirmed: "true",
          terms_accepted: "true",
          privacy_accepted: "true",
          terms_version: "2026-11-08",
          privacy_version: "2026-11-08",
          health_data_consent: healthConsent ? "true" : "false",
          food_photos_consent: foodPhotoConsent ? "true" : "false",
          food_photos_policy_version: "2026-11-11",
        },
      },
    });
    if (signupError) throw signupError;
    setMode("login");
    setEmailCooldown(60);
    setNotice("Cadastro iniciado. Aguarde a mensagem de confirmação; a entrega depende da configuração do serviço de e-mail. Verifique também a caixa de spam. O telefone informado fica apenas como contato; não enviaremos mensagens.");
  };

  const signIn = async () => {
    if (!supabase) return;
    if (loginCooldown > 0) throw new Error(`Aguarde ${loginCooldown} segundos antes de tentar entrar novamente.`);
    const { error: loginError } = await supabase!.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (loginError) {
      const next = loginFailures + 1;
      setLoginFailures(next);
      if (next >= 5) { setLoginCooldown(60); setLoginFailures(0); }
      throw loginError;
    }
    setLoginFailures(0);
  };

  const sendRecovery = async () => {
    if (!supabase) return;
    const { error: recoveryError } = await supabase!.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: PRODUCTION_ORIGIN + "/?flow=recovery" });
    if (recoveryError) throw recoveryError;
    setEmailCooldown(60);
    setNotice("Solicitação de recuperação aceita. Confira sua caixa de entrada e o spam; a entrega depende da configuração de e-mail do serviço.");
  };

  const resendConfirmation = async () => {
    if (!supabase) return;
    if (emailCooldown > 0) throw new Error(`Aguarde ${emailCooldown} segundos antes de solicitar outro e-mail.`);
    const { error: resendError } = await supabase!.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } });
    if (resendError) throw resendError;
    setEmailCooldown(60);
    setNotice("Solicitação de reenvio aceita. Confira sua caixa de entrada e o spam; a entrega depende da configuração de e-mail do serviço.");
  };

  const updatePassword = async () => {
    if (!supabase) return;
    if (newPassword.length < 8) throw new Error("Use uma senha com pelo menos 8 caracteres.");
    const { error: updateError } = await supabase!.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
    setMode("login");
    setNotice("Senha atualizada. Entre novamente.");
    await supabase!.auth.signOut();
  };

  const requestEmailChange = async () => {
    if (!supabase || !newEmail.trim()) return;
    setEmailChangeError("");
    setEmailChangeMessage("");
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim().toLowerCase() },
      { emailRedirectTo: window.location.origin },
    );
    if (error) {
      setEmailChangeError("Não foi possível registrar a troca de e-mail. Confira o endereço e tente novamente.");
      return;
    }
    setEmailCooldown(60);
    setEmailChangeMessage("Pedido de troca registrado. A alteração só será concluída após a confirmação exigida pelo serviço de autenticação. A entrega do e-mail depende da configuração do remetente.");
    setNewEmail("");
  };

  if (!supabaseConfigured || !supabase) return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><h1>Estamos preparando seu acesso</h1><p>O aplicativo ainda precisa da configuração segura de conexão para liberar cadastro e login. Nenhum dado pessoal será solicitado nesta etapa.</p></section></main>;
  if (loading) return <main className="auth-shell"><section className="auth-card"><h1>Treino Seguro</h1><p>Verificando seu acesso com segurança…</p></section></main>;

  if (session && profile?.account_status === "suspended") return <main className="auth-shell"><section className="auth-card"><h1>Conta temporariamente suspensa</h1><p>O acesso está bloqueado. Entre em contato com o suporte para receber orientação.</p><button className="auth-button secondary" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;

  if (session && profile?.email_verified_at && profile.account_status === "active") {
    const isAdmin = session.user.app_metadata?.role === "admin";
    return <>
      <div className="account-bar"><span>Olá, {profile.full_name}</span><div className="account-actions">
        {isAdmin && <button type="button" onClick={() => setAdminOpen(value => !value)}>{adminOpen ? "Voltar ao aplicativo" : "Administração"}</button>}
        <details className="account-email-change"><summary>Trocar e-mail</summary><form onSubmit={(e)=>{e.preventDefault();void requestEmailChange();}}><label>Novo e-mail<input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required autoComplete="email"/></label><button type="submit" disabled={busy}>Solicitar troca</button>{emailChangeMessage&&<p role="status">{emailChangeMessage}</p>}{emailChangeError&&<p role="alert">{emailChangeError}</p>}</form></details><button onClick={() => void supabase!.auth.signOut()}>Sair da conta</button>
      </div></div>
      {isAdmin && adminOpen ? <AdminPanel currentUserId={profile.id} /> : <App userId={profile.id} initialLevel={profile.training_level} initialPlace={profile.training_place} initialDays={String(profile.training_days)} />}
    </>;
  }

  if (session && !profile) return <main className="auth-shell"><section className="auth-card"><h1>Conferindo cadastro</h1><p>Não foi possível carregar o perfil cadastral. Atualize a página ou tente entrar novamente.</p><button className="auth-button secondary" onClick={() => void loadProfile(session.user)}>Tentar novamente</button><button className="auth-link" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;

  if (session && profile) return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><h1>Confirme seu e-mail</h1><p className="auth-muted">Por segurança, o acesso ao aplicativo é liberado após a confirmação do endereço de e-mail. O telefone informado no cadastro é somente um contato; não fazemos integração nem enviamos mensagens.</p><div className="verification-row"><b>E-mail</b><span>{profile.email_verified_at ? "Confirmado" : "Aguardando confirmação"}</span></div>{!profile.email_verified_at ? <p>Quando receber a mensagem de confirmação, abra o link e depois volte para entrar. A entrega depende da configuração do serviço de e-mail.</p> : <><p>Seu e-mail foi confirmado. Estamos atualizando o acesso da sua conta.</p><button className="auth-button secondary" onClick={() => void loadProfile(session.user)}>Atualizar acesso</button></>}{error&&<p className="auth-error">{error}</p>}{notice&&<p className="auth-success">{notice}</p>}<button className="auth-link" onClick={() => void supabase!.auth.signOut()}>Sair</button></section></main>;



  const title = mode === "signup" ? "Criar sua conta" : mode === "forgot" ? "Recuperar acesso" : mode === "recovery" ? "Criar nova senha" : "Entre na sua conta";
  return <main className="auth-shell"><section className="auth-card"><div className="auth-brand">Treino Seguro</div><span className="auth-eyebrow">SAÚDE EM MOVIMENTO</span><h1>{title}</h1><p className="auth-muted">Um espaço de orientação para adultos, com cuidado e respeito ao seu ritmo.</p>
    {mode === "signup" ? <form onSubmit={(e)=>void run(e,signUp)}><label>Nome completo<input autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} required minLength={2}/></label><label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Telefone para contato<input type="tel" autoComplete="tel" placeholder="31 99999-9999" value={phone} onChange={e=>setPhone(e.target.value)} required/></label><label>Senha (mínimo de 8 caracteres)<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required/></label><p className="muted" aria-live="polite">Força da senha: {password.length < 8 ? "fraca — use pelo menos 8 caracteres" : password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? "forte" : "média — combine letras maiúsculas, minúsculas, números e símbolos"}.</p>
      <div className="auth-consents"><label><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/> Confirmo que tenho 18 anos ou mais.</label><label><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> Aceito os <a href="/termos" target="_blank" rel="noreferrer">Termos de Uso</a>.</label><label><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/> Li e aceito a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label><hr/><p>Autorizações opcionais — você pode continuar sem marcar:</p><label><input type="checkbox" checked={healthConsent} onChange={e=>setHealthConsent(e.target.checked)}/> Autorizo o tratamento de dados de saúde para as funções que dependem deles.</label><label><input type="checkbox" checked={foodPhotoConsent} onChange={e=>setFoodPhotoConsent(e.target.checked)}/> Autorizo separadamente o envio e armazenamento privado de fotos de alimentos.</label><p className="muted">As duas autorizações são independentes. Você pode recusar qualquer uma e continuar usando as funções básicas. Fotos são anexos visuais; calorias dependem da escolha manual do alimento e da quantidade.</p></div><button className="auth-button" disabled={busy}>{busy?"Aguarde…":"Criar conta"}</button></form> : mode === "recovery" ? <form onSubmit={(e)=>void run(e,updatePassword)}><label>Nova senha<input type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={8} required/></label><p className="muted" aria-live="polite">Força da senha: {newPassword.length < 8 ? "fraca — use pelo menos 8 caracteres" : newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? "forte" : "média — combine letras maiúsculas, minúsculas, números e símbolos"}.</p><button className="auth-button" disabled={busy}>Salvar nova senha</button></form> : <form onSubmit={(e)=>void run(e,mode==="forgot"?sendRecovery:signIn)}><label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>{mode!=="forgot"&&<label>Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>}<button className="auth-button" disabled={busy || (mode==="login" && loginCooldown > 0) || (mode==="forgot" && emailCooldown > 0)}>{busy?"Aguarde…":mode==="forgot" ? (emailCooldown > 0 ? `Aguarde ${emailCooldown}s` : "Enviar link de recuperação") : loginCooldown > 0 ? `Tente novamente em ${loginCooldown}s` : "Entrar"}</button></form>}
    {error&&<p className="auth-error" role="alert">{error}</p>}{notice&&<p className="auth-success" role="status">{notice}</p>}<div className="auth-switch">{mode==="login"?<><button onClick={()=>{setMode("signup");setError("");setNotice("");}}>Criar uma conta</button><button onClick={()=>{setMode("forgot");setError("");setNotice("");}}>Esqueci minha senha</button><button disabled={emailCooldown > 0 || busy} onClick={(e)=>void run(e,resendConfirmation)}>{emailCooldown > 0 ? `Reenviar confirmação em ${emailCooldown}s` : "Reenviar confirmação de e-mail"}</button></>:<button onClick={()=>{setMode("login");setError("");setNotice("");}}>Voltar para entrar</button>}</div></section></main>;
}

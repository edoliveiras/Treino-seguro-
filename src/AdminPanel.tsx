import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, UserRound, UserX, UserCheck, Trash2 } from "lucide-react";
import { supabase } from "./lib/supabase";

type Account = {
  id: string;
  full_name: string;
  email: string;
  whatsapp_e164: string;
  account_status: "pending_verification" | "active" | "suspended";
  email_verified_at: string | null;
  created_at: string;
};

export default function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccounts = useCallback(async () => {
    if (!supabase) {
      setError("Serviço de contas indisponível.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase
        .from("admin_account_directory")
        .select("id,full_name,email,whatsapp_e164,account_status,email_verified_at,created_at")
        .order("created_at", { ascending: false });
      if (queryError) {
        setError("Não foi possível carregar as contas. Confira se seu perfil tem permissão de administrador.");
        setAccounts([]);
      } else {
        setAccounts((data ?? []) as Account[]);
      }
    } catch {
      setError("Não foi possível carregar as contas. Verifique sua conexão.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAccounts(); }, [loadAccounts]);

  const updateAccount = async (account: Account, action: "suspend" | "reactivate" | "delete") => {
    if (!supabase) return;
    if (action === "delete" && !window.confirm(`Excluir definitivamente a conta de ${account.full_name}?`)) return;
    setBusyId(account.id);
    setError("");
    setNotice("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-account", {
        body: { action, targetUserId: account.id },
      });
      if (invokeError || !data?.success) {
        setError("Não foi possível concluir a ação administrativa. Verifique a implantação do serviço e tente novamente.");
      } else {
        setNotice(action === "delete" ? "Conta excluída." : action === "suspend" ? "Conta suspensa." : "Conta reativada.");
        await loadAccounts();
      }
    } catch {
      setError("Não foi possível concluir a ação administrativa. Verifique sua conexão e tente novamente.");
    } finally {
      setBusyId("");
    }
  };

  return <main className="admin-main"><section className="panel admin-panel">
    <div className="admin-panel-heading">
      <div><span className="eyebrow">GESTÃO RESTRITA</span><h2>Administração de contas</h2></div>
      <button className="secondary" type="button" onClick={() => void loadAccounts()} disabled={loading}><RefreshCw size={16}/> Atualizar</button>
    </div>
    <div className="bmi"><ShieldCheck/><div><b>Área exclusiva de administração</b><p>Mostra somente dados cadastrais e situação das contas. Avaliações e informações de saúde não aparecem neste painel.</p></div></div>
    {error && <p role="alert" className="auth-error">{error}</p>}
    {notice && <p role="status" className="success-text">{notice}</p>}
    {loading ? <p>Carregando contas…</p> : accounts.length === 0 ? <p>Nenhuma conta cadastrada.</p> : <div className="admin-account-list">
      {accounts.map(account => <article className="admin-account-card" key={account.id}>
        <div className="admin-account-main">
          <UserRound size={20}/>
          <div><b>{account.full_name}</b><span>{account.email}</span><small>Telefone de contato: {account.whatsapp_e164}</small></div>
        </div>
        <div className="admin-account-meta">
          <span className={`account-status status-${account.account_status}`}>{account.account_status === "active" ? "Ativa" : account.account_status === "suspended" ? "Suspensa" : "Pendente de e-mail"}</span>
          <small>{account.email_verified_at ? "E-mail confirmado" : "E-mail não confirmado"}</small>
        </div>
        <div className="admin-account-actions">
          {account.account_status === "suspended"
            ? <button type="button" className="secondary" disabled={busyId === account.id} onClick={() => void updateAccount(account, "reactivate")}><UserCheck size={16}/> Reativar</button>
            : <button type="button" className="secondary" disabled={busyId === account.id} onClick={() => void updateAccount(account, "suspend")}><UserX size={16}/> Suspender</button>}
          {account.id !== currentUserId && <button type="button" className="danger-button" disabled={busyId === account.id} onClick={() => void updateAccount(account, "delete")}><Trash2 size={16}/> Excluir</button>}
        </div>
      </article>)}
    </div>}
  </section></main>;
}

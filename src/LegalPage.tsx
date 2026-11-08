import App from "./App";

export default function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const privacy = kind === "privacy";
  return <main className="auth-shell"><article className="auth-card legal-card">
    <div className="auth-brand">Treino Seguro</div>
    <span className="auth-eyebrow">INFORMAÇÕES IMPORTANTES</span>
    <h1>{privacy ? "Política de Privacidade" : "Termos de Uso"}</h1>
    <p className="auth-muted">Versão inicial de 8 de novembro de 2026. Este texto é informativo e deverá passar por revisão jurídica antes da abertura pública do serviço.</p>
    {privacy ? <>
      <h2>1. Dados tratados</h2><p>Para criar e proteger uma conta, o aplicativo utiliza nome, e-mail, telefone para contato, confirmação de idade adulta e registros de consentimento. Se você optar por utilizar funções que dependem dessas informações, poderá inserir dados relacionados à saúde, medidas e alimentação. O envio e o armazenamento de fotos de evolução ainda não estão disponíveis.</p>
      <h2>2. Finalidades</h2><p>Os dados cadastrais são usados para autenticação por e-mail, segurança, suporte e gestão da conta. O telefone é apenas um dado de contato e não é confirmado por mensagem. Dados de saúde só são sincronizados após autorização específica e opcional. Fotos e notificações ainda não estão disponíveis.</p>
      <h2>3. Armazenamento e segurança</h2><p>O cadastro e a autenticação usam a infraestrutura Supabase. Dados de avaliação, treinos, refeições, peso e medidas só são sincronizados quando a pessoa concede autorização específica para dados de saúde. O acesso aos registros é limitado à própria conta por políticas de segurança no banco. A autorização pode ser retirada; após a retirada, novas leituras e gravações são bloqueadas, e a pessoa pode apagar os registros armazenados. Fotos de evolução ainda não são armazenadas pelo aplicativo.</p>
      <h2>4. Escolhas e direitos</h2><p>A autorização opcional para sincronização de dados de saúde pode ser recusada ou retirada sem impedir o uso das funções que não dependem dela. Na aba Privacidade, você pode retirar a autorização e apagar os registros de saúde armazenados. Solicitações de acesso, correção e exclusão da conta dependerão de um canal de atendimento a ser definido antes da publicação.</p>
      <h2>5. Retenção e contato</h2><p>Os dados serão mantidos pelo tempo necessário à prestação do serviço e ao cumprimento de obrigações legais. Antes da publicação, o responsável pelo aplicativo deverá incluir um canal de contato para solicitações de privacidade e definir prazos específicos de retenção e descarte.</p>
    </> : <>
      <h2>1. Público e finalidade</h2><p>O Treino Seguro é um aplicativo educativo destinado exclusivamente a pessoas com 18 anos ou mais. Seu conteúdo apresenta informações gerais sobre atividade física, movimento e hábitos saudáveis.</p>
      <h2>2. Não substitui profissionais</h2><p>O aplicativo não diagnostica, não prescreve tratamento e não substitui avaliação médica, nutricional ou de profissional de Educação Física. Procure orientação individual antes de iniciar ou alterar atividades, especialmente se tiver doenças, dores, limitações ou sintomas.</p>
      <h2>3. Uso responsável</h2><p>Interrompa a atividade e procure atendimento diante de dor no peito, desmaio, tontura importante, falta de ar intensa ou incomum, fraqueza súbita ou dor que piora. Em emergência, procure atendimento imediato.</p>
      <h2>4. Conta e segurança</h2><p>O cadastro exige e-mail confirmado. O telefone informado é apenas um dado de contato, sem integração com aplicativos de mensagens. Mantenha suas credenciais em sigilo e informe dados verdadeiros. O acesso pode ser bloqueado em caso de uso indevido ou risco à segurança.</p>
      <h2>5. Limitações</h2><p>O conteúdo é fornecido para fins educativos e pode ser atualizado. Resultados variam entre pessoas. Nenhuma meta de peso, desempenho ou mudança corporal é garantida.</p>
      <h2>6. Privacidade</h2><p>O tratamento de dados pessoais é descrito na Política de Privacidade. A autorização para sincronização de dados de saúde é opcional e separada dos termos obrigatórios. Fotos e notificações ainda não estão disponíveis.</p>
    </>}
    <button className="auth-button" onClick={() => { window.location.assign("/?mode=signup"); }}>Voltar ao cadastro</button>
  </article></main>;
}

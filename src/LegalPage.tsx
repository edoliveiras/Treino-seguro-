import App from "./App";

export default function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const privacy = kind === "privacy";
  return <main className="auth-shell"><article className="auth-card legal-card">
    <div className="auth-brand">Treino Seguro</div>
    <span className="auth-eyebrow">INFORMAÇÕES IMPORTANTES</span>
    <h1>{privacy ? "Política de Privacidade" : "Termos de Uso"}</h1>
    <p className="auth-muted">Versão inicial de 8 de novembro de 2026. Este texto é informativo e deverá passar por revisão jurídica antes da abertura pública do serviço.</p>
    {privacy ? <>
      <h2>1. Dados tratados</h2><p>Para criar e proteger uma conta, o aplicativo utiliza nome, e-mail, telefone para contato, confirmação de idade adulta e registros de consentimento. Se você optar por utilizar funções que dependem dessas informações, poderá inserir dados relacionados à saúde, medidas, alimentação e fotos de evolução.</p>
      <h2>2. Finalidades</h2><p>Os dados cadastrais são usados para autenticação por e-mail, segurança, suporte e gestão da conta. O telefone é apenas um dado de contato e não é confirmado por mensagem. Dados de saúde e fotos só devem ser utilizados nas funções correspondentes quando houver autorização específica e opcional.</p>
      <h2>3. Compartilhamento e segurança</h2><p>O serviço utiliza infraestrutura de autenticação e banco de dados da Supabase. Códigos de confirmação são temporários, protegidos e não ficam disponíveis para leitura direta pelo navegador. Senhas e chaves administrativas não são compartilhadas com outros usuários.</p>
      <h2>4. Escolhas e direitos</h2><p>Autorizações opcionais podem ser recusadas sem impedir a criação da conta, embora a função dependente possa ficar indisponível. Você poderá solicitar acesso, correção, informação, revogação de consentimento e exclusão da conta, observadas as hipóteses legais de retenção.</p>
      <h2>5. Retenção e contato</h2><p>Os dados serão mantidos pelo tempo necessário à prestação do serviço e ao cumprimento de obrigações legais. Antes da publicação, o responsável pelo aplicativo deverá incluir um canal de contato para solicitações de privacidade e definir prazos específicos de retenção e descarte.</p>
    </> : <>
      <h2>1. Público e finalidade</h2><p>O Treino Seguro é um aplicativo educativo destinado exclusivamente a pessoas com 18 anos ou mais. Seu conteúdo apresenta informações gerais sobre atividade física, movimento e hábitos saudáveis.</p>
      <h2>2. Não substitui profissionais</h2><p>O aplicativo não diagnostica, não prescreve tratamento e não substitui avaliação médica, nutricional ou de profissional de Educação Física. Procure orientação individual antes de iniciar ou alterar atividades, especialmente se tiver doenças, dores, limitações ou sintomas.</p>
      <h2>3. Uso responsável</h2><p>Interrompa a atividade e procure atendimento diante de dor no peito, desmaio, tontura importante, falta de ar intensa ou incomum, fraqueza súbita ou dor que piora. Em emergência, procure atendimento imediato.</p>
      <h2>4. Conta e segurança</h2><p>O cadastro exige e-mail confirmado. O telefone informado é apenas um dado de contato, sem integração com aplicativos de mensagens. Mantenha suas credenciais em sigilo e informe dados verdadeiros. O acesso pode ser bloqueado em caso de uso indevido ou risco à segurança.</p>
      <h2>5. Limitações</h2><p>O conteúdo é fornecido para fins educativos e pode ser atualizado. Resultados variam entre pessoas. Nenhuma meta de peso, desempenho ou mudança corporal é garantida.</p>
      <h2>6. Privacidade</h2><p>O tratamento de dados pessoais é descrito na Política de Privacidade. Autorizações para dados de saúde, fotos e notificações são opcionais e separadas dos termos obrigatórios.</p>
    </>}
    <button className="auth-button" onClick={() => { window.location.assign("/?mode=signup"); }}>Voltar ao cadastro</button>
  </article></main>;
}

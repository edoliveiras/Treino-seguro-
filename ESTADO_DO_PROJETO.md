# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 08/11/2026

## 1. Projeto
- Aplicativo web em português, responsivo e mobile-first, destinado a adultos (18+).
- Código React + TypeScript + Vite; repositório GitHub na branch main. Lovable permanece apenas como visualizador.
- O workspace Lovable consultado não possui um projeto Treino Seguro cadastrado. A configuração `vercel.json` foi adicionada, mas o projeto ainda não foi conectado a um serviço de hospedagem e não existe URL pública.
- Banco Supabase dedicado ao Treino Seguro. O projeto Empório EdTudo não foi acessado nem alterado.

## 2. Aplicativo existente
- Áreas: Início, Avaliação, Treino, Exercícios, Nutrição, Evolução, Ciência e Privacidade.
- Avaliação educativa com peso, altura, IMC aproximado, objetivo, disponibilidade, local, nível, dores/limitações, condições de saúde e declarações.
- IMC é triagem, não diagnóstico. IMC estimado ≥ 35 bloqueia recomendação automática de corrida.
- Dores/limitações ocultam a biblioteca de movimentos até avaliação individual; condições específicas exigem orientação/liberação médica declarada.
- Conteúdo de exercícios é demonstrativo e inclui adaptações, cuidados e sinais de alerta.
- Diário alimentar não estima calorias nem reconhece alimentos por foto.
- Avaliações, parâmetros de treino, exercícios marcados, refeições, peso e medidas são salvos em um registro individual no Supabase após consentimento específico. O usuário pode conceder/retirar a autorização e apagar os dados armazenados.
- Fotos de evolução ainda não estão habilitadas; não existe upload nem bucket de imagens.

## 3. Banco e segurança de contas
- Projeto Supabase dedicado ativo e saudável; tabelas de cadastro, consentimentos, preferências, OTP e auditoria criadas e com RLS habilitado.
- Migrações de conta e autenticação aplicadas; migrações 008 a 012 criam `health_data_records`, RLS de propriedade/conta ativa/e-mail confirmado/consentimento vigente, índices para consultas e chaves estrangeiras, políticas RLS otimizadas, exclusão permitida ao titular mesmo com conta suspensa e bootstrap de primeiro administrador restrito a `service_role`. O acesso anon é negado; authenticated recebe apenas as permissões cobertas por RLS.
- As tabelas estão vazias; não há contas ou dados clínicos cadastrados.
- Verificação de segurança do Supabase: sem alertas ativos após as últimas correções. Operações administrativas são verificadas na Edge Function e novamente no banco, consultando o papel de administrador em app_metadata.
- A chave publishable do projeto está configurada no cliente; nenhuma chave service_role ou segredo de provedor está no navegador ou no repositório.

## 4. Cadastro e autenticação implementados no código
- Tela de cadastro: nome, e-mail, WhatsApp com DDD e senha.
- Declaração de 18 anos, aceite obrigatório dos Termos e da Política; consentimento opcional para dados de saúde. Fotos e notificações não são solicitadas porque ainda não estão disponíveis.
- Login por e-mail e senha, reenvio do link de confirmação, recuperação e redefinição de senha.
- Confirmação do e-mail via Supabase Auth. O telefone é coletado apenas como contato, sem integração com aplicativos de mensagens ou envio de mensagens.
- O app libera as áreas após confirmação do e-mail e status ativo.
- Páginas iniciais de Termos e Política incluídas; ainda precisam de revisão jurídica, dados de contato do controlador e definição final de retenção.

## 5. Envio e funções administrativas — ainda não ativados
- O fluxo público não utiliza Facebook, Meta, WhatsApp, SMS ou OTP por telefone. O código e as tabelas antigas de OTP permanecem apenas como legado de testes; não são chamados pelo aplicativo e não devem ser implantados.
- A interface de administração de contas foi criada e só aparece quando o token da conta contém o papel `admin`; ela lista dados cadastrais e oferece suspensão, reativação e exclusão, sem expor dados de saúde.
- A Edge Function administrativa ainda não foi implantada no projeto; as ações do painel não funcionarão até a implantação e configuração da origem pública.
- Ainda não foi criado um usuário administrador. O primeiro administrador poderá receber o papel por função de bootstrap executável somente por `service_role`, para uma conta ativa e com e-mail confirmado, se ainda não existir administrador.
- Confirmação por e-mail depende de confirmar a configuração do Supabase Auth, URLs de retorno e template de e-mail.

## 6. Testes e validação
- Testes de interface, persistência com consentimento, regras de segurança, build, verificação estática das Edge Functions, testes dos componentes OTP e testes SQL das migrações em PostgreSQL temporário.
- A execução CI #226 concluiu com sucesso: testes do aplicativo (incluindo consentimento e persistência), compilação, tipos das Edge Functions, testes OTP e migrações SQL passaram.
- Testes automatizados não substituem teste real de cadastro, confirmação de e-mail, recuperação de senha, RLS e suspensão em ambiente de homologação.

## 7. Pendências para disponibilização pública
1. Confirmar no Supabase Auth a confirmação de e-mail, o modelo da mensagem e a lista de URLs de retorno permitidas; o teste transacional do banco confirmou que conta não verificada fica pendente e que a confirmação de e-mail a ativa.
2. Definir a URL definitiva de publicação e configurar os redirecionamentos de autenticação.
3. Homologar em duas contas reais o salvamento, carregamento após novo login, isolamento entre usuários, revogação e exclusão dos registros de saúde.
4. Publicar a Edge Function administrativa com a origem pública configurada e criar o primeiro administrador por procedimento seguro.
5. Realizar testes reais com duas contas: cadastro, confirmação de e-mail, recuperação, suspensão, exclusão e isolamento dos dados.
6. Revisão jurídica da LGPD, Termos e Política; definir contato do controlador, retenção, exclusão e direitos dos titulares.
7. Revisão clínica e editorial por profissionais habilitados antes de uso público.
8. Planejar publicação e testar em celulares reais. Não declarar produto pronto, clinicamente validado ou em conformidade legal antes dessas etapas.

## 8. Fontes bibliográficas do aplicativo
- Bull FC et al. (2020), diretrizes OMS: https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. (2009), ACSM: https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. (2021), Cochrane: https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde (2014), Guia Alimentar: https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP (2011), TACO: https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

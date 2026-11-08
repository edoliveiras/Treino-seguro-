# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 08/11/2026

## 1. Projeto
- Aplicativo web em português, responsivo e mobile-first, destinado a adultos (18+).
- Código React + TypeScript + Vite; repositório GitHub na branch main. Lovable permanece apenas como visualizador.
- Banco Supabase dedicado ao Treino Seguro. O projeto Empório EdTudo não foi acessado nem alterado.

## 2. Aplicativo existente
- Áreas: Início, Avaliação, Treino, Exercícios, Nutrição, Evolução, Ciência e Privacidade.
- Avaliação educativa com peso, altura, IMC aproximado, objetivo, disponibilidade, local, nível, dores/limitações, condições de saúde e declarações.
- IMC é triagem, não diagnóstico. IMC estimado ≥ 35 bloqueia recomendação automática de corrida.
- Dores/limitações ocultam a biblioteca de movimentos até avaliação individual; condições específicas exigem orientação/liberação médica declarada.
- Conteúdo de exercícios é demonstrativo e inclui adaptações, cuidados e sinais de alerta.
- Diário alimentar não estima calorias nem reconhece alimentos por foto.
- Dados de treino, alimentação, peso e medidas continuam somente na sessão do navegador; ainda não são salvos no banco.
- Fotos de evolução ainda não estão habilitadas.

## 3. Banco e segurança de contas
- Projeto Supabase dedicado ativo e saudável; tabelas de cadastro, consentimentos, preferências, OTP e auditoria criadas e com RLS habilitado.
- Migrações 001 a 007 aplicadas no banco: perfil cadastral, consentimentos separados, preferências opcionais, OTP, auditoria, proteção da função de sincronização, políticas explícitas de negação de acesso direto às tabelas internas e RPCs administrativas exclusivas da service_role.
- As tabelas estão vazias; não há contas ou dados clínicos cadastrados.
- Verificação de segurança do Supabase: sem alertas ativos após as últimas correções. Operações administrativas são verificadas na Edge Function e novamente no banco, consultando o papel de administrador em app_metadata.
- A chave publishable do projeto está configurada no cliente; nenhuma chave service_role ou segredo de provedor está no navegador ou no repositório.

## 4. Cadastro e autenticação implementados no código
- Tela de cadastro: nome, e-mail, WhatsApp com DDD e senha.
- Declaração de 18 anos, aceite obrigatório dos Termos e da Política; consentimentos de saúde e fotos opcionais e separados; notificações opcionais desligadas por padrão.
- Login por e-mail e senha, reenvio do link de confirmação, recuperação e redefinição de senha.
- Confirmação do e-mail via Supabase Auth. O telefone é coletado apenas como contato, sem integração com aplicativos de mensagens ou envio de mensagens.
- O app libera as áreas após confirmação do e-mail e status ativo.
- Páginas iniciais de Termos e Política incluídas; ainda precisam de revisão jurídica, dados de contato do controlador e definição final de retenção.

## 5. Envio e funções administrativas — ainda não ativados
- O fluxo público não utiliza Facebook, Meta, WhatsApp, SMS ou OTP por telefone. O código e as tabelas antigas de OTP permanecem apenas como legado de testes; não são chamados pelo aplicativo e não devem ser implantados.
- A Edge Function administrativa ainda não foi implantada no projeto.
- Ainda não foi criado um usuário administrador. O primeiro administrador deverá receber o papel exclusivamente por procedimento seguro no servidor, nunca por cadastro público.
- Confirmação por e-mail depende de confirmar a configuração do Supabase Auth, URLs de retorno e template de e-mail.

## 6. Testes e validação
- Testes de interface e regras de segurança existentes; CI executa testes, build, verificação estática das Edge Functions, testes dos componentes OTP e testes SQL das migrações em PostgreSQL temporário.
- A execução mais recente de CI após a mudança para ativação somente por e-mail foi concluída com sucesso: instalação, testes do aplicativo, compilação, verificação de tipos das Edge Functions, testes dos componentes OTP e testes SQL das migrações.
- Testes automatizados não substituem teste real de cadastro, confirmação de e-mail, recuperação de senha, RLS e suspensão em ambiente de homologação.

## 7. Pendências para disponibilização pública
1. Confirmar no Supabase Auth a confirmação de e-mail, o modelo da mensagem e a lista de URLs de retorno permitidas; o teste transacional do banco confirmou que conta não verificada fica pendente e que a confirmação de e-mail a ativa.
2. Definir a URL definitiva de publicação e configurar os redirecionamentos de autenticação.
3. Implementar persistência segura para treino, alimentação e evolução, com RLS e consentimentos apropriados; hoje esses registros existem apenas na sessão do navegador.
4. Implantar a Edge Function administrativa somente quando o painel de gestão estiver pronto e criar o primeiro administrador por procedimento seguro.
5. Realizar testes reais com duas contas: cadastro, confirmação de e-mail, recuperação, suspensão, exclusão e isolamento dos dados.
7. Revisão jurídica da LGPD, Termos e Política; definir contato do controlador, retenção, exclusão e direitos dos titulares.
8. Revisão clínica e editorial por profissionais habilitados antes de uso público.
9. Planejar publicação e testar em celulares reais. Não declarar produto pronto, clinicamente validado ou em conformidade legal antes dessas etapas.

## 8. Fontes bibliográficas do protótipo
- Bull FC et al. (2020), diretrizes OMS: https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. (2009), ACSM: https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. (2021), Cochrane: https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde (2014), Guia Alimentar: https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP (2011), TACO: https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

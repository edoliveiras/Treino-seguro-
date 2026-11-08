# Cadastro, autenticação e vínculo de conta — Treino Seguro

Status: **banco Supabase dedicado criado e protegido; telas de cadastro/login e ligação do cliente estão versionadas**. A confirmação por e-mail/WhatsApp ainda depende da configuração e implantação dos serviços externos e de testes reais. Não apresentar o envio de códigos como ativo até concluir essa etapa.

## Fluxo obrigatório

1. Formulário: nome, e-mail, WhatsApp em E.164 (+55...), senha (ou magic link), autodeclaração 18+.
2. Termos de Uso e Política de Privacidade em caixas independentes, desmarcadas por padrão e obrigatórias para criar conta.
3. Consentimento de dados de saúde e fotos em caixas distintas, opcionais, desmarcadas por padrão. Explicar finalidade, retenção, acesso e como revogar. Não condicionar a criação da conta a esses consentimentos; bloquear somente a funcionalidade dependente.
4. Preferências de lembretes de treino, lembrete de foto a cada 3 semanas e novidades em escolhas separadas, todas desligadas por padrão.
5. Supabase Auth envia confirmação real por e-mail. Confirm Email deve permanecer habilitado. O app só libera conteúdo privado após email_confirmed_at e profiles.whatsapp_verified_at existirem e account_status='active'.
6. OTP do WhatsApp: 6 dígitos, expiração de 10 minutos, máximo de 5 tentativas, intervalo mínimo de 60 segundos entre reenvios e no máximo 3 envios por telefone em janela móvel de 60 minutos. Bloqueio temporário depois de tentativas esgotadas. Erros não revelam se e-mail/telefone já pertence a uma conta.
7. WhatsApp oficial: Meta WhatsApp Business Platform / Cloud API, com modelo de mensagem de autenticação aprovado. Se a Meta falhar, a Edge Function tenta enviar o mesmo código por SMS usando Twilio Programmable Messaging. Tokens e identificadores ficam somente em secrets de Edge Functions. O fallback só funciona depois da configuração e de testes reais.
8. Troca de e-mail: Supabase Auth updateUser e confirmação do novo endereço antes de atualizar o estado verificado. Troca de WhatsApp: novo OTP e só substituir o telefone após sucesso, mantendo o antigo até então.
9. Recuperação: link de recuperação Supabase Auth por e-mail. Recuperação por WhatsApp deve verificar OTP e então emitir fluxo seguro de recuperação, sem enviar senha nem permitir redefinição apenas com número não verificado.
10. Exclusão, suspensão e reativação: endpoints administrativos no servidor, role verificada em app_metadata (nunca metadata editável pelo usuário), confirmação reforçada, auditoria sem dados clínicos e exclusão coordenada.

## Modelo de autorização

- profiles contém somente nome, e-mail, telefone, status, role, datas de confirmação e cadastro.
- Administrador vê somente o diretório cadastral admin_account_directory, nunca tabelas de saúde, refeições, peso, medidas ou fotos.
- Tabelas clínicas futuras terão RLS própria por auth.uid(), sem política de leitura para administrador.
- OTP, logs de envio e auditoria não têm políticas de acesso direto ao navegador.
- Suspender bloqueia sessão e ações no backend; ocultar interface não é segurança.
- Exclusão deve chamar Admin API no servidor, registrar o evento sem PII e executar rotina de exclusão conforme retenção legal aprovada.

## Proteção de OTP (Edge Functions obrigatórias)

- Gerar código com crypto.getRandomValues, nunca Math.random.
- Guardar somente HMAC-SHA-256 do código, usando OTP_HMAC_SECRET em secrets; nunca armazenar OTP em texto.
- RPC transacional para criar challenge, contar envios nas últimas 1h, aplicar intervalo mínimo e invalidar challenge anterior.
- RPC transacional para validar expiração, incrementar tentativas, bloquear após 5 falhas e consumir código uma única vez.
- Normalizar telefone E.164 no servidor. Unicidade no banco impede duas contas com o mesmo WhatsApp.
- Sem leitura/escrita direta das tabelas OTP pelo cliente.
- Rate limit adicional por IP/identificador e CAPTCHA na borda, com erros genéricos e logs sem códigos ou PII.

## Implementação técnica versionada (ainda não implantada)

- Edge Function: `supabase/functions/phone-otp/index.ts`, com ações autenticadas `send` e `verify`. Exige sessão do próprio usuário e e-mail confirmado; não aceita telefone enviado pelo navegador, consulta o telefone cadastrado no perfil.
- RPCs transacionais: `supabase/migrations/202611080002_phone_otp_rpc.sql`. Aplicam expiração de 10 minutos, máximo de 5 tentativas, bloqueio de 15 minutos após falhas, intervalo de 60 segundos e limite de 3 solicitações por número em 1 hora.
- O telefone só fica reservado para uma conta depois de confirmado; números ainda não verificados não bloqueiam o titular legítimo. A unicidade é aplicada aos números verificados.
- O código é gerado com Web Crypto, e somente HMAC-SHA-256 é persistido. A função não retorna o código e não o registra em logs.
- O envio Meta usa template de autenticação aprovado, com parâmetro do corpo e botão de copiar código. O formato deve corresponder exatamente ao template aprovado na conta Meta. <https://whatsapp.serpro.gov.br/api-docs/guia-rapido/como-enviar-mensagens-notificacao/>
- A função responde com mensagens genéricas para evitar revelar dados de cadastro. A função está protegida por sessão e origem permitida (`APP_ORIGIN`).

### Meta WhatsApp Cloud API
Secrets de produção: `APP_ORIGIN`, `OTP_HMAC_SECRET` (mínimo 32 caracteres), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`, `WHATSAPP_OTP_TEMPLATE_NAME` e `WHATSAPP_OTP_TEMPLATE_LANGUAGE`. O template de autenticação precisa estar aprovado no WhatsApp Manager e ter corpo com variável e botão de copiar código compatíveis com o payload. Token e service role nunca vão para React, Vite, GitHub ou navegador.

### Fallback SMS via Twilio
- A Edge Function tenta primeiro a Meta Cloud API e, em caso de falha, tenta Twilio Programmable Messaging com o mesmo OTP e a mesma expiração/tentativas controladas pelo banco.
- Secrets adicionais: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_MESSAGING_SERVICE_SID`.
- A função registra o provedor efetivamente utilizado (Meta ou Twilio) sem guardar o código.
- Este é envio via Twilio Messaging Service, não Twilio Verify. É necessário configurar remetente/Messaging Service, habilitar destinos brasileiros, saldo e conformidade do provedor.
- Se ambos os provedores falharem, o desafio fica inválido para uso prático e a resposta informa indisponibilidade sem expor detalhes do provedor. O fallback está versionado, mas ainda não foi testado com credenciais reais.

### Supabase
- VITE_SUPABASE_URL e chave publishable/anon no frontend; nunca chave secret/service-role.
- Confirm Email ligado, URL de retorno permitida e templates de confirmação/recuperação configurados.
- SUPABASE_URL e chave secret/service-role somente em Edge Functions.
- OTP_HMAC_SECRET em secrets de Edge Functions.
- Aplicar migração e testar duas contas, telefone duplicado, OTP expirado, tentativas erradas, reenvio, usuário suspenso e usuário anônimo.

## Decisões de privacidade

- Termos e Política: obrigatórios para a conta, com versão e data.
- Dados de saúde e fotos: consentimentos separados, específicos, opcionais e revogáveis. Se revogados, impedir novos usos para a finalidade e executar política de retenção/exclusão definida.
- Notificações: opt-in independente por categoria; revogação imediata.
- Não guardar data de nascimento se a autodeclaração 18+ cumprir a finalidade; a declaração não é verificação de idade.
- Revisão jurídica e de segurança independente antes de produção.

## Estado técnico real

- Migrações 001 a 006 aplicadas no projeto Supabase dedicado; as tabelas cadastrais, de consentimento, preferências, OTP e auditoria estão vazias e protegidas por RLS.
- O cliente React usa a chave publishable do projeto Supabase. A chave service_role e os segredos dos provedores não são enviados ao navegador nem armazenados no repositório.
- O código contém cadastro, login, reenvio de confirmação de e-mail, recuperação de senha, consentimentos, tela de confirmação de WhatsApp e bloqueio do aplicativo até os dois contatos serem confirmados e a conta estar ativa.
- Páginas iniciais de Termos e Política estão no aplicativo; exigem revisão jurídica e inclusão dos dados de contato do controlador.
- Edge Functions de OTP e administração estão versionadas, mas ainda não implantadas. Faltam APP_ORIGIN, OTP_HMAC_SECRET, service role em secrets, credenciais da Meta/Twilio e template de autenticação aprovado.
- Não há envio real de e-mail, WhatsApp ou SMS comprovado. A configuração de confirmação de e-mail no Supabase Auth e as URLs de retorno ainda precisam ser verificadas.
- Não existe primeiro administrador criado. A atribuição do papel deve ocorrer apenas por procedimento seguro no servidor.
- Não há dados clínicos, fotos, peso, medidas ou diário alimentar persistidos no banco. Essas funções continuam apenas na sessão local.
- A revisão jurídica, clínica e os testes reais de ponta a ponta permanecem obrigatórios antes da publicação.

## Gestão administrativa de contas — implementação versionada
- Edge Function `supabase/functions/admin-account/index.ts`: aceita somente POST com JWT válido, origem igual a `APP_ORIGIN` e usuário cuja `app_metadata.role` seja `admin`. Depois de verificar o usuário, usa service_role apenas no servidor; as RPCs conferem novamente `auth.users.raw_app_meta_data` antes de executar.
- A função permite suspender, reativar ou excluir uma conta chamando RPCs protegidas. A autorização também é verificada no banco; a validação no Edge Function não é a única barreira.
- Migrações `202611080003_admin_delete.sql` e `202611080006_restrict_admin_account_rpcs.sql`: exclusão atômica da conta e RPCs administrativas restritas à service_role, com verificação independente do administrador em `auth.users.raw_app_meta_data`.
- A exclusão administrativa não equivale a uma política completa de retenção/eliminação de backups. A retenção legal, backups, solicitações do titular e revisão jurídica ainda precisam ser definidos antes de produção.
- As migrações estão aplicadas no projeto Supabase. As Edge Functions continuam apenas versionadas e não implantadas; faltam os secrets de produção e a URL definitiva do aplicativo.

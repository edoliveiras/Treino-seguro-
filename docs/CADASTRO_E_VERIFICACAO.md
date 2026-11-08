# Cadastro, autenticação e vínculo de conta — Treino Seguro

Status: **base de banco e especificação preparadas; não implantadas nem conectadas**. O repositório ainda não tem projeto Supabase configurado nem credenciais de provedores. Não apresentar o cadastro como funcional até aplicar a migração, implantar as Edge Functions, configurar provedores e concluir testes reais.

## Fluxo obrigatório

1. Formulário: nome, e-mail, WhatsApp em E.164 (+55...), senha (ou magic link), autodeclaração 18+.
2. Termos de Uso e Política de Privacidade em caixas independentes, desmarcadas por padrão e obrigatórias para criar conta.
3. Consentimento de dados de saúde e fotos em caixas distintas, opcionais, desmarcadas por padrão. Explicar finalidade, retenção, acesso e como revogar. Não condicionar a criação da conta a esses consentimentos; bloquear somente a funcionalidade dependente.
4. Preferências de lembretes de treino, lembrete de foto a cada 3 semanas e novidades em escolhas separadas, todas desligadas por padrão.
5. Supabase Auth envia confirmação real por e-mail. Confirm Email deve permanecer habilitado. O app só libera conteúdo privado após email_confirmed_at e profiles.whatsapp_verified_at existirem e account_status='active'.
6. OTP do WhatsApp: 6 dígitos, expiração de 10 minutos, máximo de 5 tentativas, intervalo mínimo de 60 segundos entre reenvios e no máximo 3 envios por telefone em janela móvel de 60 minutos. Bloqueio temporário depois de tentativas esgotadas. Erros não revelam se e-mail/telefone já pertence a uma conta.
7. WhatsApp oficial: Meta WhatsApp Business Platform / Cloud API, com modelo de mensagem de autenticação aprovado. Token e Phone Number ID somente em secrets de Edge Functions. Se o provedor Meta não estiver configurado, fallback explícito para SMS via Twilio; não simular envio.
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

## Configuração dos provedores

### Meta WhatsApp Cloud API
Secrets de produção: WHATSAPP_PROVIDER=meta, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION, WHATSAPP_OTP_TEMPLATE_NAME e WHATSAPP_OTP_TEMPLATE_LANGUAGE. O template de autenticação precisa estar aprovado no WhatsApp Manager. Token nunca vai para React, Vite, GitHub ou navegador.

### Fallback SMS
Secrets: OTP_FALLBACK_PROVIDER=twilio, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_VERIFY_SERVICE_SID. O fallback precisa ser configurado e testado antes de habilitado. Provedor não configurado significa que cadastro não conclui verificação.

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

- A migração supabase/migrations/202611080001_account_security.sql prepara tabelas, unicidade, RLS, status e trilha administrativa.
- Ainda faltam Edge Functions de envio/validação OTP, endpoints administrativos completos, tela de cadastro/login/consentimentos, recuperação e troca de contato, testes de integração e configuração do projeto/provedores.
- A migração não foi executada. Não há envio real de e-mail, WhatsApp ou SMS.

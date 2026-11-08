# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 2026-11-08 (base de cadastro e segurança de contas preparada; ainda não implantada)

## 1. Repositório e fluxo
- Repositório: https://github.com/edoliveiras/Treino-seguro-
- Branch: `main`
- Código mantido diretamente no GitHub; Lovable será somente visualizador.
- Aplicação: React + TypeScript + Vite, em português, responsiva e mobile-first.
- CI em `.github/workflows/ci.yml`: `npm install`, `npm test` e `npm run build` em push/PR.

## 2. O que já está implementado
- Navegação para Início, Avaliação, Treino, Exercícios, Nutrição, Evolução, Ciência e Privacidade.
- Menu lateral em telas grandes e navegação horizontal compacta em telas menores.
- Indicador de foco visível para botões, campos e links; contraste de textos auxiliares reforçado.
- Avaliação local com peso, altura, IMC aproximado, objetivo, disponibilidade, local, nível, dores/limitações, condições de saúde, declaração de maioridade e aviso educativo.
- IMC apresentado como triagem, nunca diagnóstico nem critério único de prescrição.
- Condições de saúde exigem orientação/liberação médica declarada pelo usuário; isso é autodeclaração e não comprovação clínica.
- Mudança de condição de saúde reinicia a declaração de liberação e invalida avaliação concluída.
- Opção “Nenhuma” mutuamente exclusiva das outras opções nos grupos de dor e condição.
- IMC estimado >= 35 com objetivo “Começar a correr” bloqueia conclusão da avaliação e mostra cautela.
- Dor/limitação informada oculta a biblioteca de movimentos e orienta avaliação individual.
- Acesso ao treino exige avaliação válida; alterações nos parâmetros invalidam conclusão anterior.
- Seis movimentos educativos com instruções, adaptações e cuidados; marcação concluída só na sessão.
- Diário alimentar textual, sem reconhecimento de imagens nem estimativa de calorias.
- Evolução com registros temporários de peso e cintura; sem persistência nem gráficos longitudinais.
- Fotos desativadas; interface explica que só devem ser ativadas com armazenamento privado, consentimento e exclusão segura.
- Tela de privacidade deixa claro que não existe envio nem persistência em servidor.
- Tela Ciência com OMS, ACSM, Cochrane, Guia Alimentar brasileiro e TACO.
- Sinais de alerta para interromper atividade e procurar atendimento.

## 3. Testes e estado de CI
- `src/safety.test.ts`: 6 testes de regras puras.
- `src/App.test.tsx`: 8 testes de interface.
- Total: **14 testes aprovados**.
- Commit dos testes: `33fbdf65f407d931e7f8eb3f91b18f828235ef7a`; workflow 42479956704: 14 testes e build aprovados.
- Commit do ajuste de contraste: `da1785b36022bfa6dc43635e168910c2fc514f8e`; workflow 42479881418: testes e build aprovados.
- Os testes atuais cobrem: bloqueio de acesso direto ao treino, revalidação após mudanças de objetivo/peso/altura/dias/local/nível/maioridade/aviso educativo, ocultação de exercícios após relato de dor, navegação móvel, reinício da declaração médica, bloqueio de corrida no cenário definido e exclusividade de “Nenhuma”.

## 4. Arquitetura, privacidade e limitações
- Documento de proposta: `docs/ARQUITETURA_BACKEND_LGPD.md`.
- Requisitos de conta: `docs/CADASTRO_E_VERIFICACAO.md`.
- Migração inicial de contas: `supabase/migrations/202611080001_account_security.sql` (criada no GitHub, **não aplicada**).
- **Não existe backend implantado, autenticação ativa no app, banco conectado, sincronização ou upload de fotos implementado.** Há apenas uma migração SQL preparada para futura aplicação.
- Os dados digitados ficam apenas na memória da página e são perdidos ao atualizar/fechar.
- O documento LGPD é uma proposta técnica; não é implementação nem comprovação de conformidade.
- A migração de contas prepara perfil cadastral separado, unicidade de e-mail/WhatsApp, eventos de consentimento, preferências de notificações, tabelas privadas para OTP, RLS e auditoria de ações administrativas. Ela não implementa o envio nem a validação do OTP, nem a tela de cadastro.
- Não habilitar persistência ou fotos antes de revisão jurídica/de segurança, consentimento adequado, controles de acesso, testes de autorização, exportação e exclusão.
- Público-alvo definido: adultos 18+; a idade é autodeclarada, não verificada.
- O app é educativo e não substitui médico, nutricionista ou profissional de Educação Física.
- O bloco de sete semanas é organização didática, não protocolo clínico validado.

## 5. Fontes bibliográficas usadas no protótipo
- Bull FC et al. (2020), diretrizes OMS de atividade física: https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. (2009), ACSM: https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. (2021), Cochrane sobre exercício e dor lombar crônica: https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde (2014), Guia Alimentar: https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP (2011), TACO 4ª edição: https://www.fao.org/food-composition/tables-and-databases/detail/%28brazil--2011%29-tabela-brasileira-de-composi%C3%A7%C3%A3o-de-alimentos-%28taco%29/en

## 6. Pendências prioritárias
1. **P0 — Ampliar cobertura de segurança:** testar alterações de todos os campos após avaliação, estado de avaliação após alternar telas, combinações de condições e fluxo completo com liberação autodeclarada.
2. **P0 — Acessibilidade:** auditoria de contraste de toda a interface, leitor de tela, nomes acessíveis, ordem de foco e testes em viewport estreita.
3. **P1 — Revisão clínica/editorial:** revisão por profissionais habilitados das orientações, triagem e exercícios antes de uso público.
4. **P1 — Revisão jurídica e segurança:** política de privacidade, termos, base legal, consentimento específico, retenção e direitos dos titulares.
5. **P1 — Backend seguro:** aplicar e revisar a migração; implementar Supabase Auth, confirmação de e-mail, Edge Functions para OTP Meta/Twilio, recuperação/troca de contato, bloqueio de suspensos, exclusão administrativa e testes RLS antes de ativar autenticação.
6. **P2 — Personalização de treinos:** considerar dias, nível, local e limitações sem prescrição automática em cenários de risco.
7. **P2 — Conteúdo multimídia licenciado:** imagens/vídeos profissionais, erros comuns e contraindicações revisadas.
8. **P2 — Nutrição:** integração confiável com TACO/Guia Alimentar; não habilitar reconhecimento por foto ou calorias sem método validado.
9. **P3 — Configurar Lovable como visualizador e planejar publicação após as revisões e serviços externos necessários.**

## 7. Próximo passo exato
CI validado no commit `33fbdf65f407d931e7f8eb3f91b18f828235ef7a` (workflow 42479956704: 14 testes e build aprovados). A migração de contas foi criada, mas não foi executada nem testada contra Supabase. Próximo passo: implementar Edge Functions de OTP e fluxo de cadastro/login, com configuração por secrets e testes negativos; depois integrar a interface. Manter autenticação, backend, persistência clínica e fotos desativados até configuração e validação real. Manter backend, persistência e fotos desativados. Não declarar o produto publicado, clinicamente validado ou LGPD-compliant.

## 8. Atualização de execução — 08/11/2026
- A migração inicial de contas e o documento de cadastro/OTP estão versionados na branch main. Commit mais recente da migração: `abda0c71da26c85bb04351c29815065b9e780fd0`.
- CI desse commit: workflow 42480280197 concluído com sucesso. Isso valida somente os comandos automatizados já configurados (`npm install`, testes do app e build); **não executa nem valida a migração SQL em um banco Supabase**.
- O esquema SQL continua como rascunho técnico não implantado. A criação de Edge Functions, envio real de OTP, cadastro/login integrado, recuperação, gestão administrativa e testes SQL/RLS continuam pendentes.
- Não ativar autenticação nem prometer confirmação por e-mail/WhatsApp enquanto o projeto Supabase não estiver conectado e configurado com os secrets do provedor. Não colocar chaves no repositório ou no frontend.


## 9. Continuação — OTP WhatsApp e validação estática
- Criada a Edge Function `supabase/functions/phone-otp/index.ts`: exige usuário autenticado e e-mail confirmado, gera código de 6 dígitos com Web Crypto, armazena somente HMAC-SHA-256 e envia por template de autenticação da Meta. A ação `verify` valida o código sem expô-lo em resposta ou logs.
- Criada a migração `supabase/migrations/202611080002_phone_otp_rpc.sql`: RPCs restritas à service_role, expiração de 10 minutos, 5 tentativas, bloqueio de 15 minutos, 60 segundos entre envios e máximo de 3 solicitações por número/hora. O WhatsApp só é reservado após verificação, reduzindo risco de bloqueio por cadastro falso.
- A função Meta requer template de autenticação aprovado com parâmetro no corpo e botão de copiar código. O fallback Twilio SMS ainda não foi implementado.
- CI ampliado para instalar Deno e executar `deno check` da Edge Function. A primeira execução falhou por configuração de dependências npm; foi adicionado `deno.json` com resolução automática. A nova execução do workflow 42481004788 estava em andamento no momento desta atualização.
- As migrações continuam sem validação em PostgreSQL/Supabase e não foram aplicadas. A Edge Function não foi implantada nem testada com credenciais/provedor reais. Não existe envio de OTP em produção.
- Próximas tarefas: confirmar CI com Deno; validar migrações em banco de homologação; adicionar testes de integração/abuso; implementar adaptador Twilio Verify; concluir cadastro/login, recuperação, troca de contato e painel administrativo; somente então integrar ao frontend.


## 10. Validação adicional
- Deno foi incluído no CI com `deno check` para a Edge Function. Workflow 42481004788 (commit `f231aadb74bf76e3e7ca58b3ed4608a677a2041c`) concluiu com sucesso: 14 testes do app, build e verificação estática da Edge Function.
- Migração RPC endurecida para exigir claim `service_role`; números de WhatsApp são únicos somente após verificação.
- Respostas da solicitação de envio foram uniformizadas para reduzir enumeração de contas/telefones.
- Último commit funcional registrado nesta atualização: `1ccfd563b64d74c07eb25ae39417d174983cbe9d`. CI correspondente: workflow 42481048682 em execução no momento do registro.
- A aprovação de CI não substitui teste SQL em PostgreSQL/Supabase, teste de entrega real da Meta, revisão de segurança ou implantação.


## 11. Continuação — fallback SMS Twilio (08/11/2026)
- A Edge Function `supabase/functions/phone-otp/index.ts` agora tenta primeiro enviar OTP pelo template oficial da Meta WhatsApp Cloud API e, se houver falha, tenta Twilio Programmable Messaging por SMS. O mesmo código permanece controlado pelo banco, com HMAC, expiração e limite de tentativas.
- O registro de entrega agora identifica o provedor efetivamente usado (`meta_whatsapp` ou `twilio_sms`) sem armazenar o OTP.
- Secrets necessários para o fallback: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_MESSAGING_SERVICE_SID`. A documentação foi atualizada em `docs/CADASTRO_E_VERIFICACAO.md`.
- Commits desta etapa: função SMS `6966898ef36a83fefc58196251c2a8b5930b2df5`; RPC de registro do provedor `1942ae7856979a53ee6060be8af22ea1c8f58e18`; documentação `afab482e3cf9b13f2e737b50dab58ed8e929f046`.
- CI dos commits de código `42481144741` e `42481152231` estava em execução no momento do registro; não declarar aprovação até conclusão.
- O envio Meta/Twilio ainda não foi testado com contas e credenciais reais. Não há implantação Supabase, tela de cadastro/login, recuperação ou troca de contato conectadas ao frontend. A migração SQL segue sem execução e sem validação PostgreSQL.
- Próxima etapa: verificar os dois workflows, adicionar testes unitários para geração/validação de payload e testar as RPCs/migrações em PostgreSQL/Supabase de homologação; depois implementar cadastro/login e recuperação no app, mantendo dados de saúde/fotos desativados.


## 12. Testes unitários OTP e correção de compatibilidade SQL — 08/11/2026
- Extraídas as primitivas de OTP para `supabase/functions/phone-otp/otp.ts`: geração criptograficamente segura de código de seis dígitos, validação estrita do formato e HMAC-SHA-256.
- Adicionados quatro testes Deno em `supabase/functions/phone-otp/otp_test.ts`, cobrindo formato/quantidade de códigos, aceitação/rejeição de entradas, determinismo/tamanho do HMAC e rejeição de segredo curto/código malformado.
- CI atualizado para executar `deno test --no-lock supabase/functions/phone-otp/otp_test.ts` além do type-check existente.
- Uma execução inicial dos novos testes falhou porque o padrão de dígitos foi gravado com escape duplicado. O log do workflow confirmou a causa; o padrão foi corrigido e a execução 42481535444 concluiu com sucesso. A execução 42481532789 ainda corresponde à versão intermediária com o defeito, não ao estado final.
- Revisão da migração encontrou incompatibilidade entre o CHECK antigo do campo `provider` (que não aceitava `twilio_sms`) e a nova RPC de registro de entrega. A migração `202611080002_phone_otp_rpc.sql` agora atualiza essa constraint para aceitar o identificador efetivo do fallback SMS.
- A correção SQL está versionada, mas **ainda não foi aplicada nem testada em PostgreSQL/Supabase**. A aprovação do CI não valida migrações, RLS, autenticação, Meta ou Twilio.
- Próximo passo: validar migrações/RPCs em banco Supabase de homologação, com casos de sucesso, expiração, tentativas, bloqueio, rate limit e unicidade; depois implementar telas de cadastro/login/recuperação e bloqueio de contas suspensas. Manter o fluxo de contas desativado até essa validação.


## 13. Proteção de dados na sessão e testes SQL automatizados — 08/11/2026
- A área Privacidade agora oferece o comando “Apagar dados desta sessão”, que limpa peso, altura, objetivo, disponibilidade, nível, dores/condições, autodeclarações, marcações de exercícios, diário alimentar e registros de evolução mantidos em memória.
- Botões de conclusão de exercícios agora expõem nome individual acessível e estado marcado/desmarcado por `aria-pressed`.
- Adicionados testes de interface para apagar os dados e verificar os nomes/estados acessíveis dos exercícios; ampliados os testes puros para entradas inválidas, cenários combinados e limiar de corrida.
- CI agora inicia PostgreSQL 16 temporário, cria um stub mínimo de Supabase Auth e executa as duas migrações com `supabase/tests/account_security.test.sql`. A primeira execução completa com a nova etapa aprovou: testes do app, build, type-check Deno, testes OTP e testes SQL de sincronização de perfil, consentimentos, OTP válido, registro do fallback SMS, ativação após dupla verificação, limite de tentativas/bloqueio, expiração e proteção contra reutilização de WhatsApp já verificado.
- Importante: PostgreSQL temporário + stub valida sintaxe e comportamento básico das migrações/RPCs, mas não equivale a um projeto Supabase real. Ainda faltam testes de RLS com usuários reais/roles, Auth real, implantação de Edge Function, confirmação de e-mail, envio Meta/Twilio e teste de recuperação.
- Os dados de avaliação, peso, refeições e evolução seguem somente em memória e são apagados ao atualizar/fechar ou pelo novo comando de limpeza. Não foi habilitada persistência nem fotos.
- Próxima etapa técnica: ampliar testes de autorização/RLS e corrigir quaisquer problemas encontrados; depois preparar a integração Auth com variáveis de ambiente, mantendo o fluxo desligado até a configuração real de Supabase e provedores. A revisão clínica, jurídica e de segurança independente continua necessária antes de uso público.

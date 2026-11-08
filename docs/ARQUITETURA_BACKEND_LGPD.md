# Arquitetura proposta — backend, segurança e LGPD

Status: especificação técnica inicial; **não implementada nem implantada**. Não habilitar persistência de dados de saúde com base apenas neste documento.

## 1. Princípios

- Público-alvo: pessoas adultas (18+), com confirmação de idade no cadastro e nova confirmação no primeiro uso. A autodeclaração não comprova idade; avaliar controles adicionais antes de disponibilizar publicamente.
- Coletar somente dados necessários para a função solicitada. Peso, altura, condições de saúde, dores, medidas corporais e fotos podem constituir dados pessoais sensíveis ou de alto impacto e exigem proteção reforçada.
- Não usar dados de saúde para publicidade, perfil comercial, venda, treinamento de modelos ou decisões automatizadas externas.
- Fotos permanecem desabilitadas até revisão específica de segurança, consentimento, retenção e exclusão.
- Consentimento para dados sensíveis deve ser destacado, específico, informado, separado de termos gerais e revogável. A base legal adequada deve ser validada por assessoria jurídica antes do lançamento; não presumir que consentimento seja a única base possível.
- O aplicativo é educativo. Não deve diagnosticar, prescrever para condições clínicas ou substituir profissionais.

## 2. Arquitetura recomendada

- Frontend: React + TypeScript + Vite, sem segredos embutidos no bundle.
- Backend candidato: Supabase (Auth + PostgreSQL + Storage privado), condicionado à configuração explícita do projeto e revisão de segurança.
- Autenticação: e-mail verificado; sessão segura gerenciada pelo SDK oficial. Não criar senhas próprias nem armazenar tokens no código.
- Autorização: negar por padrão; RLS habilitada em todas as tabelas expostas; políticas por `auth.uid() = user_id`; nunca confiar em IDs enviados pelo navegador.
- Ações privilegiadas somente em Edge Functions/servidor com validação de sessão e autorização. Chaves service-role nunca no frontend.
- Transporte HTTPS; backups e retenção definidos; logs sem conteúdo de saúde, peso, refeições ou fotos.
- Não instalar analytics, pixels ou ferramentas de replay que capturem formulários sensíveis.

## 3. Modelo mínimo de dados (a validar)

### `profiles`
- `id uuid primary key references auth.users(id)`
- `display_name text null`
- `adult_confirmed_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Não guardar data de nascimento se a confirmação de maioridade for suficiente para a finalidade. Se verificação real de idade for necessária, definir processo separado e minimizado.

### `privacy_consents`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `purpose text not null` (ex.: health_data, progress_photos, research)
- `policy_version text not null`
- `granted_at timestamptz not null default now()`
- `withdrawn_at timestamptz null`
- `created_at timestamptz not null default now()`

Guardar versão, finalidade e momento da escolha. Não usar um único checkbox para finalidades distintas. Registrar revogação sem manter o dado sensível desnecessariamente.

### `assessments`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `weight_kg numeric null`
- `height_cm numeric null`
- `goal text null`
- `days_per_week smallint null`
- `training_location text null`
- `experience_level text null`
- `pain_flags jsonb null`
- `health_condition_flags jsonb null`
- `created_at timestamptz not null default now()`

Dados de saúde só podem ser gravados se a finalidade estiver documentada e houver base legal validada e consentimento aplicável. Considerar separar dados de saúde em tabela restrita própria para reduzir exposição.

### `activity_logs`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `entry_type text not null` (exercise, meal, weight, waist)
- `entry_date date not null`
- `payload jsonb not null`
- `created_at timestamptz not null default now()`

O campo `payload` deve ter esquema validado no servidor por tipo; não aceitar JSON arbitrário ou conteúdo ilimitado. Avaliar separar refeições e medidas em tabelas próprias para aplicar retenção e permissões específicas.

**Não criar tabela de fotos agora.** Se o recurso for aprovado futuramente, usar bucket privado, caminhos imprevisíveis por usuário, limites de tipo/tamanho, verificação de conteúdo, URLs assinadas de curta duração e exclusão coordenada de metadados e objetos.

## 4. RLS — regras obrigatórias

Para cada tabela com dados de usuário:
- Ativar RLS explicitamente.
- SELECT, INSERT, UPDATE e DELETE limitados ao próprio `auth.uid()`.
- Em INSERT, exigir `user_id = auth.uid()` com `WITH CHECK`.
- Em UPDATE, exigir propriedade tanto em `USING` quanto em `WITH CHECK`.
- Não permitir acesso anônimo.
- Não criar política ampla do tipo `using (true)`.
- Testar tentativas de leitura, alteração e exclusão cruzadas entre duas contas distintas.
- Verificar políticas de Storage separadamente; RLS de tabelas não protege arquivos automaticamente.

## 5. Direitos, retenção e ciclo de vida

Antes de ativar contas:
- Publicar política de privacidade clara com controlador, contato, finalidades, categorias de dados, compartilhamentos, retenção, segurança e direitos.
- Disponibilizar acesso, correção, exportação e exclusão de conta/dados.
- Definir retenção por categoria e rotina de eliminação de backups conforme política.
- Implementar revogação de consentimento e bloqueio de novos tratamentos dependentes.
- Definir canal de atendimento a solicitações LGPD e processo de incidentes.
- Fazer avaliação de impacto/risco de dados pessoais e revisão jurídica e de segurança independente.

## 6. Plano de implementação em etapas

1. Criar projeto Supabase dedicado e configurar ambientes separados (desenvolvimento/produção), sem compartilhar credenciais em chats ou commits.
2. Implementar Auth e perfil mínimo, sem dados de saúde.
3. Criar migrações versionadas e políticas RLS; testar com duas contas e usuário anônimo.
4. Implementar tela de privacidade/consentimento versionado e fluxo de exportação/exclusão.
5. Só então avaliar persistência de avaliação e histórico, com minimização e finalidade definida.
6. Fotos ficam em etapa posterior e desligadas por padrão.

## 7. Critérios para liberar persistência

- [ ] Projeto e ambientes configurados com credenciais protegidas.
- [ ] RLS e políticas Storage revisadas e testadas.
- [ ] Testes negativos entre usuários aprovados.
- [ ] Consentimento separado por finalidade e versionado.
- [ ] Política, retenção, exportação e exclusão implementadas.
- [ ] Revisão de segurança e jurídica concluída.
- [ ] Plano de resposta a incidentes definido.

Até que todos os critérios aplicáveis sejam atendidos, a interface deve continuar informando que os dados ficam apenas na sessão e não deve fingir que salvou ou sincronizou informações.

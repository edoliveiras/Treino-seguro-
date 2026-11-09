# Cadastro, autenticação e gestão de contas — Treino Seguro

Status: o código contém cadastro e login por e-mail, confirmação por e-mail, recuperação de senha e painel administrativo. A integração real precisa ser homologada no projeto Supabase antes da publicação.

## Fluxo de cadastro
1. A pessoa informa nome, e-mail, telefone para contato e senha.
2. Declara ter 18 anos ou mais e aceita os Termos de Uso e a Política de Privacidade.
3. O consentimento para dados de saúde é opcional, separado e revogável. Sem ele, as funções que dependem de sincronização de dados de saúde não devem gravar esses dados na conta.
4. O Supabase Auth envia o link de confirmação por e-mail quando estiver configurado. O acesso privado só é liberado após a confirmação do e-mail e a conta estar ativa.
5. O telefone é somente um dado de contato. Não é único, não precisa ser confirmado, não participa do login nem da recuperação e não é usado para enviar mensagens.
6. A recuperação de acesso usa o link de recuperação por e-mail do Supabase Auth. A redefinição da senha ocorre após a validação do link.
7. O usuário pode sair da conta. A sessão é gerenciada pelo Supabase Auth.

## Privacidade e dados
- O cadastro guarda nome, e-mail, telefone de contato e situação da conta.
- Consentimentos obrigatórios de Termos e Política são registrados com versão.
- O consentimento para dados de saúde é independente, opcional e pode ser retirado.
- O painel administrativo não deve apresentar dados de saúde, avaliações, refeições, peso, medidas ou fotos.
- As políticas RLS devem restringir cada registro ao próprio titular, com conta ativa e consentimento vigente.
- O titular precisa conseguir retirar o consentimento e solicitar exclusão conforme política de retenção aprovada.
- O telefone não pode ser usado como fator de autenticação, identificador único ou canal de recuperação.

## Painel administrativo
- O acesso depende de papel administrativo armazenado em app_metadata, não de um campo editável pelo usuário.
- A interface permite consultar dados cadastrais e solicitar suspensão, reativação ou exclusão.
- As operações privilegiadas são executadas por Edge Function no servidor e conferidas novamente no banco.
- A Edge Function administrativa ainda precisa ser implantada e testada no Supabase real.
- O primeiro administrador deve ser criado por procedimento restrito à service_role, sem expor essa chave ao navegador.

## Migrações e compatibilidade
- As migrações antigas permanecem no histórico para permitir a evolução ordenada do banco.
- A migração mais recente define o telefone como campo de contato, retira sua unicidade e revoga permissões de execução/leitura dos objetos históricos de verificação telefônica, sem apagar dados existentes.
- O aplicativo e a função administrativa não devem chamar esses objetos antigos.
- Os testes SQL em CI usam PostgreSQL temporário e stubs mínimos de Supabase Auth. Eles não comprovam a aplicação no projeto Supabase real.

## Verificações obrigatórias antes da publicação
1. Confirmar que as migrações e as políticas RLS estão aplicadas no projeto dedicado.
2. Conferir confirmação por e-mail, recuperação, templates e URLs de retorno.
3. Testar cadastro, login, confirmação e recuperação com contas reais.
4. Testar isolamento entre duas contas, consentimento, revogação e exclusão.
5. Implantar e testar a função administrativa e o primeiro administrador.
6. Definir retenção, backups, canal de atendimento e direitos dos titulares.
7. Fazer revisão clínica/editorial, jurídica e independente de segurança.
8. Publicar somente depois da homologação e das revisões.

## Limites
- Não declarar que um e-mail foi enviado sem comprovação do serviço real.
- Não usar dados clínicos reais antes da homologação e revisão.
- Não declarar conformidade legal, validação clínica ou publicação concluída sem evidência.
- O telefone é somente contato; não configurar nem depender de serviços de mensagens, SMS ou verificação por telefone.

# ESTADO DO PROJETO — Treino Seguro
Última atualização: 16/11/2026

## 1. Aplicativo
- Aplicativo web em português, responsivo e mobile-first, destinado a adultos (18+), desenvolvido em React, TypeScript e Vite.
- Áreas: Início, Avaliação, Treino, Montar treino, Exercícios, Nutrição, Evolução, Ciência e Privacidade.
- Inclui avaliação educativa, filtros por grupos musculares e modalidades, biblioteca de exercícios, diário alimentar, registros de evolução e informações científicas.
- A avaliação considera idade declarada, peso, altura, objetivo, disponibilidade, local, nível, dores e condições informadas. IMC é apenas triagem; não é diagnóstico.
- Dor ou limitação não gera diagnóstico nem prescrição automática; a biblioteca oculta movimentos classificados com alerta compatível e o montador de treino exige avaliação individual quando necessário.
- O diário alimentar permite registrar refeições. Fotos de alimentos são opcionais; armazenamento e exclusão precisam ser homologados no ambiente real antes de uso público.

## 2. Cadastro e acesso
- O código contém cadastro, login por e-mail e senha, confirmação por e-mail, reenvio do link, recuperação e redefinição de senha.
- O acesso privado depende de confirmação do e-mail e status ativo da conta.
- O telefone é coletado somente como dado de contato. Não é único, não é verificado e não é usado para login, recuperação ou envio de mensagens.
- Não há integração com serviços de mensagens, SMS ou autenticação por telefone.
- Termos e Política estão no aplicativo, mas precisam de revisão jurídica, definição do controlador, canal de atendimento e prazos de retenção.

## 3. Supabase e dados
- O cliente do aplicativo contém a configuração pública de conexão com um projeto Supabase dedicado. A chave usada no navegador é do tipo publicável; nenhuma chave de serviço deve ficar no cliente.
- O código inclui migrações de contas, consentimentos, administração e registros de saúde, com políticas RLS para limitar dados à própria conta ativa e com consentimento vigente.
- A migração mais recente renomeia o telefone para campo de contato, remove sua função de identificador único e revoga o acesso aos artefatos históricos de verificação telefônica, sem apagar dados dessas tabelas.
- O código implementa sincronização de dados pessoais somente após autorização específica de dados de saúde. A revogação deve impedir novas leituras e gravações.
- Verificação direta em 16/11/2026: o projeto Supabase dedicado está ativo e saudável na região us-east-1. O banco registra 29 migrações; o repositório contém 25 arquivos de migração, portanto quatro scripts históricos aplicados ainda não foram recuperados. Há 4 contas de autenticação/perfis (3 com e-mail confirmado e 1 pendente), 1 administrador; as sete tabelas principais estão com RLS ativo. Foram observadas 27 políticas no esquema public e 4 políticas em storage.objects. Existem 3 registros de saúde, dos quais 1 ainda contém uma foto antiga codificada; o bucket privado food-photos está ativo e sem objetos.
- As funções Edge `admin-account`, `food-photo-consent`, `delete-my-account` e `export-my-data` estão ativas com verificação JWT obrigatória. Em 16/11/2026, as fontes das três últimas foram recuperadas do ambiente implantado e incluídas no repositório; suas operações ainda precisam de testes ponta a ponta. A consulta não expôs nem alterou segredos.
- O banco está hospedado fora do Brasil; a transferência internacional de dados precisa ser avaliada na revisão jurídica/LGPD.
- Não foi comprovada a entrega real de e-mails nem a configuração efetiva de SMTP, templates e URLs de retorno. Cadastro, confirmação, reenvio e recuperação ainda precisam de homologação com caixas de e-mail controladas.
- O envio de fotos de alimentos está temporariamente desabilitado no cliente. O banco bloqueia novos dados de imagem embutidos nos registros; o único registro legado com imagem foi preservado. O bucket privado existe, mas ainda não há objetos e a integração do cliente ao Storage não está concluída. Fotos de evolução continuam desabilitadas.

## 4. Administração
- Existe painel de administração restrito a contas com papel administrativo no token de autenticação.
- O painel lista apenas dados cadastrais e permite suspender, reativar e excluir contas por uma função protegida no servidor.
- A função `admin-account` está implantada e ativa no Supabase, com JWT obrigatório. A conta administrativa existente foi confirmada por consulta direta. Suspensão, reativação e exclusão ainda precisam de teste ponta a ponta com uma conta autenticada real.
- O painel não deve exibir avaliações, refeições, peso, medidas ou outros dados de saúde.

## 5. Testes e validação
- Última execução do CI verificada em 15/11/2026: o único trabalho e todas as etapas foram concluídos com sucesso: instalação, `npm test`, `npm run build`, verificação de tipos da função administrativa e teste SQL das migrações. O resumo da execução não expôs a contagem de testes; não reutilizar os 44 testes de uma execução anterior como resultado atual. O SQL roda em PostgreSQL temporário com stubs mínimos de Supabase Auth, portanto é simulado e não substitui testes no banco real.
- Os testes SQL usam stubs mínimos de Supabase Auth em PostgreSQL temporário. São testes automatizados simulados; não comprovam que as migrações estejam aplicadas no Supabase real.
- Os testes de interface foram atualizados para refletir o filtro atual da biblioteca e o caminho correto para marcar exercícios no plano.
- Ainda faltam testes reais de cadastro, confirmação de e-mail, recuperação, isolamento entre duas contas, consentimento, revogação, exclusão e ações administrativas no Supabase de homologação.

## 6. Pendências antes de uma versão real e segura
1. Homologar cadastro, confirmação, reenvio e recuperação de senha com e-mails reais controlados; verificar templates, remetente, domínio e URLs de retorno. Nenhum envio foi provocado nesta verificação.
2. Testar ponta a ponta, com duas contas reais, persistência, isolamento, consentimento, revogação, exclusão e ações administrativas. O teste transacional real anterior comprovou isolamento entre dois alunos e foi revertido; a preservação do histórico ao editar planos foi comprovada no CI simulado, não em teste real no Supabase.
3. Ativar a proteção do Supabase Auth contra senhas vazadas; o verificador de segurança ainda aponta essa opção como desativada e a conexão disponível não permite alterá-la.
4. Fazer revisão clínica/editorial por profissionais habilitados.
5. Fazer revisão jurídica da LGPD, Termos, Política, controlador, canal de atendimento, retenção, backups e transferência internacional de dados.
6. Fazer revisão independente de segurança e privacidade.
7. Homologar o ciclo completo de armazenamento e exclusão dos registros com fotos de alimentos, mediante consentimento.
8. Fazer teste final de navegação e autenticação na versão de produção antes de abrir o cadastro ao público.

## 7. Regra de produto
O telefone é apenas contato. O projeto não deve configurar, chamar, integrar ou depender de serviços de mensagens, SMS ou verificação por telefone. O fluxo de conta usa e-mail.


## Treinos por nível e painel do professor — 09/11/2026

- Modelos educativos prontos: iniciante (corpo inteiro, 2–3 dias alternados), intermediário (superior/inferior, 3–4 dias) e avançado (empurrar/puxar/pernas, 4–6 dias). Cada sessão tem seis exercícios.
- Ciclo de sete semanas com progressão gradual, controle de esforço, pausas ajustáveis e semana final mais leve. A periodização é uma estrutura didática, não uma exigência clínica.
- Cada exercício mostra nome simples, nome técnico secundário, séries, repetições ou duração, descanso, ritmo, versão academia/casa, adaptações educativas para joelho e lombar e orientação para procurar profissional.
- O aluno escolhe o dia da divisão, marca exercícios ou a sessão inteira e guarda histórico diário. Treinos de exemplo também registram conclusões antes da atribuição do professor.
- O painel privado do administrador inclui criação/edição/cópia de planos, busca e filtros, atribuição para vários alunos, substituição e remoção de atribuições e diretório cadastral com nome, e-mail, telefone de contato, nível e treino atual.
- As migrações das tabelas de treino, atribuições, histórico, políticas RLS e funções administrativas foram aplicadas ao Supabase. A conta proprietária está com papel administrativo confirmado.
- Teste transacional no Supabase, com duas contas temporárias: o aluno A leu o próprio treino e registrou conclusão; o aluno B não conseguiu ler nem escrever no treino do aluno A. A edição do plano e a preservação do histórico são verificadas pelo teste SQL simulado do CI; não foram confirmadas em teste transacional real no Supabase. A massa do teste real de isolamento foi revertida; não ficaram contas, planos ou conclusões de teste.
- Verificação em 16/11/2026: a implantação de produção ligada ao estado atual da branch principal está pronta; não foram encontrados erros de execução agregados nas últimas 24 horas. Isso confirma hospedagem/publicação técnica, mas não substitui o teste final de navegação, cadastro e e-mail.
- Fotos dos exemplos são ilustrativas; o atalho de fotos abre uma busca específica e o YouTube abre uma busca pelo nome simples/técnico. O professor pode cadastrar links diretos de foto e vídeo no editor.
- O telefone permanece somente como dado de contato, sem envio de mensagens, SMS ou autenticação por telefone.

### Pendências e recomendações
- A proteção do Supabase Auth contra senhas vazadas continua desativada segundo o verificador de segurança. Recomenda-se ativá-la antes de abrir o cadastro ao público; essa configuração não pôde ser alterada pela conexão disponível.
- Ainda não há alunos reais cadastrados no projeto para um teste de ponta a ponta com contas de produção. Os testes de isolamento foram feitos com contas temporárias em transação revertida.
- A última execução do fluxo automático foi concluída com sucesso em 11/11/2026: testes, compilação, verificação de tipos da função administrativa e testes SQL simulados passaram.

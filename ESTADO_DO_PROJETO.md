# ESTADO DO PROJETO — Treino Seguro
Última atualização: 09/11/2026

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
- Não foi possível consultar diretamente o painel do projeto Supabase nesta execução. Portanto, a aplicação das migrações, a saúde atual do banco, os templates de e-mail, as URLs de retorno e a persistência real ainda precisam ser confirmados no ambiente Supabase.

## 4. Administração
- Existe painel de administração restrito a contas com papel administrativo no token de autenticação.
- O painel lista apenas dados cadastrais e permite suspender, reativar e excluir contas por uma função protegida no servidor.
- A função administrativa está versionada no projeto; sua implantação no Supabase e o procedimento seguro para criar o primeiro administrador ainda precisam ser confirmados.
- O painel não deve exibir avaliações, refeições, peso, medidas ou outros dados de saúde.

## 5. Testes e validação
- A execução mais recente do CI concluiu com sucesso: testes de interface e segurança do aplicativo, compilação, verificação de tipos da função administrativa e testes SQL das migrações passaram.
- Os testes SQL usam stubs mínimos de Supabase Auth em PostgreSQL temporário. São testes automatizados simulados; não comprovam que as migrações estejam aplicadas no Supabase real.
- Os testes de interface foram atualizados para refletir o filtro atual da biblioteca e o caminho correto para marcar exercícios no plano.
- Ainda faltam testes reais de cadastro, confirmação de e-mail, recuperação, isolamento entre duas contas, consentimento, revogação, exclusão e ações administrativas no Supabase de homologação.

## 6. Pendências antes de uma versão real e segura
1. Confirmar acesso ao projeto Supabase dedicado e o estado real das migrações e políticas RLS.
2. Conferir confirmação por e-mail, templates, domínio e URLs de retorno no Supabase Auth; não há comprovação de envio real de e-mail nesta verificação.
3. Implantar e testar a função administrativa, criar o primeiro administrador por procedimento seguro e validar suspensão, reativação e exclusão.
4. Homologar com duas contas reais a persistência, o isolamento de dados, o consentimento, a revogação e a exclusão.
5. Verificar armazenamento, acesso e exclusão das fotos de alimentos, se esse recurso permanecer habilitado.
6. Fazer revisão clínica/editorial por profissionais habilitados.
7. Fazer revisão jurídica da LGPD, Termos, Política, retenção, backups e direitos dos titulares.
8. Fazer revisão independente de segurança e privacidade.
9. Definir hospedagem, domínio, URLs de retorno e publicar; ainda não há confirmação de versão pública em produção.

## 7. Regra de produto
O telefone é apenas contato. O projeto não deve configurar, chamar, integrar ou depender de serviços de mensagens, SMS ou verificação por telefone. O fluxo de conta usa e-mail.


## Treinos por nível e painel do professor — 09/11/2026

- Modelos educativos prontos: iniciante (corpo inteiro, 2–3 dias alternados), intermediário (superior/inferior, 3–4 dias) e avançado (empurrar/puxar/pernas, 4–6 dias). Cada sessão tem seis exercícios.
- Ciclo de sete semanas com progressão gradual, controle de esforço, pausas ajustáveis e semana final mais leve. A periodização é uma estrutura didática, não uma exigência clínica.
- Cada exercício mostra nome simples, nome técnico secundário, séries, repetições ou duração, descanso, ritmo, versão academia/casa, adaptações educativas para joelho e lombar e orientação para procurar profissional.
- O aluno escolhe o dia da divisão, marca exercícios ou a sessão inteira e guarda histórico diário. Treinos de exemplo também registram conclusões antes da atribuição do professor.
- O painel privado do administrador inclui criação/edição/cópia de planos, busca e filtros, atribuição para vários alunos, substituição e remoção de atribuições e diretório cadastral com nome, e-mail, WhatsApp de contato, nível e treino atual.
- As migrações das tabelas de treino, atribuições, histórico, políticas RLS e funções administrativas foram aplicadas ao Supabase. A conta proprietária está com papel administrativo confirmado.
- Teste transacional no Supabase, com duas contas temporárias: o aluno A leu o próprio treino e registrou conclusão; o aluno B não conseguiu ler nem escrever no treino do aluno A. A edição do plano preservou a conclusão anterior. Toda a massa de teste foi revertida; não ficaram contas, planos ou conclusões de teste.
- A publicação de produção está pronta no domínio principal. O build de produção concluiu sem erros.
- Fotos dos exemplos são ilustrativas; o atalho de fotos abre uma busca específica e o YouTube abre uma busca pelo nome simples/técnico. O professor pode cadastrar links diretos de foto e vídeo no editor.
- O WhatsApp permanece somente como contato cadastral, sem envio de mensagens, SMS ou autenticação por telefone.

### Pendências e recomendações
- A proteção do Supabase Auth contra senhas vazadas continua desativada segundo o verificador de segurança. Recomenda-se ativá-la antes de abrir o cadastro ao público; essa configuração não pôde ser alterada pela conexão disponível.
- Ainda não há alunos reais cadastrados no projeto para um teste de ponta a ponta com contas de produção. Os testes de isolamento foram feitos com contas temporárias em transação revertida.
- O GitHub Actions teve uma execução de SQL de teste com problema no próprio bloco de teste administrativo; o bloco foi corrigido, mas as execuções seguintes não iniciaram etapas. O build de produção e os testes transacionais diretos no Supabase foram verificados separadamente.

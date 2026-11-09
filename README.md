# Treino Seguro

Aplicativo web educativo, mobile-first e em português para adultos. Inclui avaliação inicial, orientações gerais de movimento, diário alimentar sem estimativas automáticas, registros pessoais de evolução e referências científicas.

## Executar
```bash
npm install
npm run dev
```

## Testes automatizados
```bash
npm test
npm run build
```

O CI executa testes do aplicativo, compilação, verificação de tipos da função administrativa e testes SQL das migrações em um PostgreSQL temporário com stubs mínimos de Supabase Auth. Essa simulação verifica regras SQL, mas não substitui homologação em um projeto Supabase real.

## Acessibilidade
- Atalho visível ao receber foco para pular diretamente ao conteúdo principal.
- Seção ativa anunciada por tecnologia assistiva na navegação principal e móvel.

## Segurança e limites
- Não diagnostica nem substitui médico, nutricionista ou profissional de Educação Física.
- Exclusivo para maiores de 18 anos.
- Condições de saúde informadas exigem orientação/liberação médica antes de iniciar.
- IMC é apenas triagem. IMC ≥ 35 não gera recomendação automática para corrida.
- Dor no peito, falta de ar intensa/incomum, tontura, desmaio, fraqueza/formigamento novo ou dor forte/piorando exigem interrupção e avaliação.
- Cadastro e login usam e-mail e senha, com liberação após confirmação do e-mail. O telefone informado é somente um dado de contato; não há confirmação por telefone nem integração com serviços de mensagens ou SMS.
- Avaliações, treinos, refeições, peso e medidas podem ser sincronizados na conta somente após autorização específica de dados de saúde. RLS limita leitura e gravação à própria conta, ativa e com e-mail confirmado; retirar a autorização bloqueia novas leituras/gravações. Fotos de evolução ainda não têm upload ou armazenamento habilitado.
- As telas iniciais de Termos e Política exigem revisão jurídica antes da publicação. Não use o aplicativo como serviço clínico ou para inserir dados sensíveis reais até concluir homologação e revisão.

## Fontes
- Bull FC et al. WHO 2020 guidelines. https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. ACSM position stand (2009). https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. Exercise therapy for chronic low back pain. Cochrane (2021). https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde. Guia Alimentar (2014). https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP. TACO, 4ª edição (2011). https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

## Treinos por nível e painel do professor
- Modelos educativos de corpo inteiro (iniciante), superior/inferior (intermediário) e empurrar/puxar/pernas (avançado), com seis exercícios por sessão e ciclo de sete semanas.
- Cada exercício apresenta nome simples, nome técnico em texto secundário, séries, repetições ou duração, pausa, ritmo, opções para academia e casa e adaptações educativas para joelho e lombar.
- O aluno pode escolher o dia da divisão, marcar exercícios ou concluir a sessão, e consultar o histórico diário de treinos de exemplo e atribuídos.
- O painel privado do professor permite filtrar a biblioteca, criar/editar modelos, copiar exemplos, atribuir a vários alunos, substituir ou retirar planos e consultar nome, e-mail, WhatsApp de contato, nível e treino atual.
- As atribuições e conclusões são protegidas por RLS. O aluno só consulta planos ativos atribuídos à sua própria conta. A edição do plano arquiva versões anteriores para preservar o histórico de conclusões.
- O WhatsApp é somente contato cadastral: não há envio de mensagens, SMS, autenticação ou verificação por telefone.
- As fotos dos exemplos são ilustrativas; o botão de fotos abre uma busca específica por exercício. O botão do YouTube abre uma busca pelo nome simples e técnico. O professor pode cadastrar links diretos de imagem e vídeo no editor.

A justificativa científica e as decisões de programação estão em docs/PLANOS_DE_TREINO_E_BASE_CIENTIFICA.md.

Fontes adicionais:
- ACSM, Position Stand 2026: https://doi.org/10.1249/MSS.0000000000003897
- OMS, recomendações de atividade física: https://www.who.int/europe/news-room/fact-sheets/item/physical-activity
- Ministério da Saúde, manejo da obesidade no SUS: https://linhasdecuidado.saude.gov.br/portal/obesidade-no-adulto/atencao-especializada/planejamento-terapeutico/
- OMS, cuidado da dor lombar crônica: https://www.who.int/news/item/07-12-2023-who-releases-guidelines-on-chronic-low-back-pain
- NICE, exercício terapêutico na osteoartrite: https://www.nice.org.uk/guidance/ng226/chapter/recommendations

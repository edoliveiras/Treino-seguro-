# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 2026-11-08 (etapa: correção JSX + gates de segurança + CI validado)

## A. Funções já prontas no código (protótipo)
- Aplicação React + TypeScript + Vite, interface em português e responsiva/mobile-first.
- Navegação: Início, Avaliação, Treino, Exercícios, Nutrição, Evolução, Ciência e Privacidade.
- Avaliação em memória: peso, altura, IMC e classificação aproximada, objetivo, dias disponíveis, local, nível, dores/limitações e condições de saúde.
- Exige confirmação de maioridade (18+) e leitura do aviso educativo; exige declaração de orientação/liberação médica quando uma condição de saúde é marcada.
- Aviso de segurança fixo e sinais de alerta para interromper exercício.
- Mensagem de cautela para IMC >= 35 e prioridade de baixo impacto; sem plano de corrida automático.
- Seis exercícios demonstrativos com instruções, adaptações e cuidados; marcação de conclusão apenas na sessão.
- Diário alimentar textual e registros de peso/cintura apenas na sessão.
- Fotos desativadas; interface explica a razão de segurança.
- Tela de privacidade explica que não existe persistência ou envio a servidor.
- Tela Ciência com referências e resumos informativos.
- Workflow GitHub Actions em .github/workflows/ci.yml configurado para npm install e npm run build em push/PR para main.
- Triagem corrigida: “Nenhuma” é mutuamente exclusiva das demais opções em cada grupo.
- Mudanças na avaliação invalidam a conclusão anterior; ao alterar condições de saúde, a autodeclaração de liberação é reiniciada.
- Campos de peso/altura agora validam faixas plausíveis de entrada antes de concluir a avaliação.
- Se IMC ≥ 35 e o objetivo selecionado for começar a correr, a conclusão da avaliação fica bloqueada e o app explica a restrição.
- Se o usuário informa dor/limitação, o app oculta os exercícios demonstrativos e orienta avaliação profissional individual antes de exibir movimentos.
- Tipos de React adicionados como dependências de desenvolvimento e declaração de tipos do Vite criada em src/vite-env.d.ts.

## B. Pendências (prioridade)
1. **P0 — Testes automatizados:** criar testes para exclusividade de opções, validação de peso/altura/idade declarada, bloqueio de corrida e ocultação da biblioteca quando há dor/limitação.
2. **P0 — Revisar triagem de segurança:** impedir combinações contraditórias como “Nenhuma” + condição/dor; garantir que liberação declarada não seja tratada como validação clínica; revisar fluxo para menores e estados de avaliação.
3. **P1 — Persistência segura:** definir backend, autenticação, autorização por usuário, RLS, minimização de dados e consentimentos LGPD antes de armazenar dados de saúde.
4. **P1 — Persistência de avaliações, treinos, refeições e histórico**, com exportação e exclusão.
5. **P1 — Política de privacidade, termos, consentimento explícito para dados sensíveis e fotos, retenção e canal de direitos.**
6. **P2 — Fotos privadas:** armazenamento privado, URLs assinadas, controles de acesso, exclusão verificável e consentimento separado; manter desativado até isso existir.
7. **P2 — Progressão de treino individualizada:** dias 2–5, nível, limitações, condições, baixo impacto; sem prescrição automática para casos de risco.
8. **P2 — Biblioteca multimídia:** imagens e vídeos profissionais licenciados, erros comuns e contraindicações revisadas.
9. **P2 — Nutrição:** integração confiável com TACO e Guia Alimentar; reconhecimento por foto e calorias somente com metodologia validada, estimativas rotuladas e orientação profissional.
10. **P3 — Gráficos, metas e indicadores longitudinais; testes automatizados e acessibilidade.**
11. **P3 — Configurar visualização no Lovable (somente visualizador) e publicação após testes e serviços externos.**

## C. Decisões e suposições
- Público-alvo: adultos 18+; interface brasileira em português.
- Aplicativo educativo, não diagnóstico nem substituto de médico, nutricionista ou profissional de Educação Física.
- Sem banco de dados, autenticação, upload de fotos ou sincronização neste momento; todos os registros atuais são temporários na memória da página.
- Não coletar nem armazenar dados sensíveis até controles de segurança, consentimento e governança estarem implementados.
- IMC é triagem e não deve definir sozinho saúde ou treino.
- IMC >= 35 aciona cautela e baixo impacto; não se apresenta corrida como recomendação automática.
- Condição de saúde marcada exige avaliação/orientação médica antes de iniciar. A caixa de confirmação do usuário é apenas autodeclaração, não comprovação de liberação.
- Bloco de 7 semanas é organização didática, não protocolo clínico validado.
- Lovable será usado apenas como visualizador; código no GitHub.
- Repositório: https://github.com/edoliveiras/Treino-seguro- ; branch main.

## D. Fontes científicas incluídas no protótipo (verificação bibliográfica ainda precisa ser auditada)
- Bull FC et al. (2020), WHO 2020 guidelines on physical activity and sedentary behaviour, British Journal of Sports Medicine 54:1451–1462. https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. (2009), Appropriate physical activity intervention strategies for weight loss and prevention of weight regain for adults, Medicine & Science in Sports & Exercise 41(2):459–471; PMID 19127177. https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. (2021), Exercise therapy for chronic low back pain, Cochrane Database of Systematic Reviews 9:CD009790; PMID 34580864. https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde (2014), Guia Alimentar para a População Brasileira, 2ª edição. https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP (2011), Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição. https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

## E. Erros conhecidos / riscos
- ESTADO_DO_PROJETO.md não existia no repositório até esta atualização.
- CI do commit 4420d2dc50baac43d91f50c24cb3151cb532bda1, 28c78c5631c881d7f51d4670bf1eff343a720710 e revisão atual 69a97df15de0f7c8d4dcb64c710d9ba6eca9f091 passou (`npm run build` sucesso; workflow 42479210353). Os commits intermediários 4366f6d e 6ce5097 falharam por fechamento incorreto de JSX, corrigido em de13d69 e validado nas execuções seguintes.
- Campos e listas de avaliação usam estado local; atualizar/fechar página perde os dados.
- Seleção “Nenhuma” nos grupos de dores/condições agora é mutuamente exclusiva com as demais opções.
- A confirmação de liberação médica é autodeclarada e não verificada.
- O cálculo do IMC não valida todos os limites clínicos e não deve ser usado para prescrição.
- Diário alimentar não calcula calorias nem reconhece fotos.
- Sem fotos, gráficos reais, banco de dados, autenticação ou sincronização.
- Metadados de Bull et al. (2020), Donnelly et al. (2009), Hayden et al. (2021), Guia Alimentar (2014) e TACO (2011) conferidos em fontes bibliográficas/organizacionais; a TACO continua como referência de composição, não reconhecimento automático de refeições.

## F. Próximo passo exato
A compilação da revisão atual está validada no workflow 42479210353 (sucesso). Próximo passo: extrair as regras de triagem para funções puras e adicionar testes automatizados para exclusividade das opções, validação dos campos, bloqueio de corrida com IMC ≥ 35 e ocultação de exercícios quando há dor/limitação. Manter fotos e persistência desativadas até implementar backend, autorização e LGPD.

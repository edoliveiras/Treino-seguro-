# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 2026-11-08 (etapa: navegação móvel e acessibilidade básica + CI aprovado)

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
- Workflow GitHub Actions em .github/workflows/ci.yml configurado para npm install, npm test e npm run build em push/PR para main.
- Testes React Testing Library em src/App.test.tsx: acesso direto ao Treino sem avaliação é bloqueado; mudanças após avaliação exigem nova conclusão; biblioteca é ocultada após relato de dor/limitação; todas as oito áreas são acessíveis pela navegação móvel.
- Navegação horizontal compacta adicionada para tablets e celulares (até 850px), corrigindo ausência de navegação quando a barra lateral ficava oculta.
- Indicador de foco visível adicionado a botões, campos e links para navegação por teclado.
- Regras de triagem isoladas em src/safety.ts e usadas pelo app: exclusividade de “Nenhuma”, validação de peso/altura, revisão médica, revisão por dor/limitação e bloqueio de corrida com IMC ≥ 35.
- Testes automatizados Vitest em src/safety.test.ts: 6 testes de regras puras em src/safety.test.ts e 4 testes de interface em src/App.test.tsx; total de 10 testes aprovados no workflow 42479710744.
- Elegibilidade para concluir a avaliação centralizada em canCompleteAssessment; o treino volta a exigir saved e canStart simultaneamente.
- Alterações em objetivo, dias, local, nível, liberação médica, maioridade ou aviso educativo invalidam a avaliação concluída.
- Triagem corrigida: “Nenhuma” é mutuamente exclusiva das demais opções em cada grupo.
- Mudanças na avaliação invalidam a conclusão anterior; ao alterar condições de saúde, a autodeclaração de liberação é reiniciada.
- Campos de peso/altura agora validam faixas plausíveis de entrada antes de concluir a avaliação.
- Se IMC ≥ 35 e o objetivo selecionado for começar a correr, a conclusão da avaliação fica bloqueada e o app explica a restrição.
- Se o usuário informa dor/limitação, o app oculta os exercícios demonstrativos e orienta avaliação profissional individual antes de exibir movimentos.
- Tipos de React adicionados como dependências de desenvolvimento e declaração de tipos do Vite criada em src/vite-env.d.ts.

## B. Pendências (prioridade)
1. **P0 — Expandir testes de segurança de ponta a ponta:** cobrir seleção de condição de saúde, reinício da confirmação médica, bloqueio de corrida por IMC e alterações de cada campo depois da conclusão.
2. **P0 — Acessibilidade e experiência móvel:** testar contraste, leitores de tela, ordem de foco e layout em viewport estreita.
3. **P1 — Revisão técnica externa:** validar arquitetura, base legal, política de privacidade e controles de dados sensíveis antes de qualquer persistência.
4. **P0 — Revisar triagem de segurança:** impedir combinações contraditórias como “Nenhuma” + condição/dor; garantir que liberação declarada não seja tratada como validação clínica; revisar fluxo para menores e estados de avaliação.
5. **P1 — Persistência segura:** implementar somente após revisão jurídica e de segurança, seguindo docs/ARQUITETURA_BACKEND_LGPD.md.
6. **P1 — Persistência de avaliações, treinos, refeições e histórico**, com exportação e exclusão.
7. **P1 — Política de privacidade, termos, consentimento explícito para dados sensíveis e fotos, retenção e canal de direitos.**
8. **P2 — Fotos privadas:** armazenamento privado, URLs assinadas, controles de acesso, exclusão verificável e consentimento separado; manter desativado até isso existir.
9. **P2 — Progressão de treino individualizada:** dias 2–5, nível, limitações, condições, baixo impacto; sem prescrição automática para casos de risco.
10. **P2 — Biblioteca multimídia:** imagens e vídeos profissionais licenciados, erros comuns e contraindicações revisadas.
11. **P2 — Nutrição:** integração confiável com TACO e Guia Alimentar; reconhecimento por foto e calorias somente com metodologia validada, estimativas rotuladas e orientação profissional.
12. **P3 — Gráficos, metas e indicadores longitudinais; testes automatizados e acessibilidade.**
13. **P3 — Configurar visualização no Lovable (somente visualizador) e publicação após testes e serviços externos.**

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

## D. Arquitetura e fontes
- Especificação inicial de backend, autenticação, RLS, consentimento, retenção, direitos e critérios de liberação documentada em docs/ARQUITETURA_BACKEND_LGPD.md. Não é implementação, não comprova conformidade LGPD e não ativa armazenamento.

### Fontes científicas incluídas no protótipo (verificação bibliográfica ainda precisa ser auditada)
- Bull FC et al. (2020), WHO 2020 guidelines on physical activity and sedentary behaviour, British Journal of Sports Medicine 54:1451–1462. https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. (2009), Appropriate physical activity intervention strategies for weight loss and prevention of weight regain for adults, Medicine & Science in Sports & Exercise 41(2):459–471; PMID 19127177. https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. (2021), Exercise therapy for chronic low back pain, Cochrane Database of Systematic Reviews 9:CD009790; PMID 34580864. https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde (2014), Guia Alimentar para a População Brasileira, 2ª edição. https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP (2011), Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição. https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

## E. Erros conhecidos / riscos
- ESTADO_DO_PROJETO.md não existia no repositório até esta atualização.
- CI do commit 975ee7319d8fe8519ad9c78bc2a1d8b18c187391 passou `npm test` e `npm run build` no workflow 42479288776. O commit 0f03da5 falhou em `npm test` devido a `\\n` literal inserido no import de safety.test.ts; corrigido no commit 7fb652189efb50c1aa9d6c878c440802ae2db0be. Workflow 42479447651 estava em andamento na última consulta.
- Campos e listas de avaliação usam estado local; atualizar/fechar página perde os dados.
- Seleção “Nenhuma” nos grupos de dores/condições agora é mutuamente exclusiva com as demais opções.
- A confirmação de liberação médica é autodeclarada e não verificada.
- O cálculo do IMC não valida todos os limites clínicos e não deve ser usado para prescrição.
- Diário alimentar não calcula calorias nem reconhece fotos.
- Sem fotos, gráficos reais, banco de dados, autenticação ou sincronização.
- Metadados de Bull et al. (2020), Donnelly et al. (2009), Hayden et al. (2021), Guia Alimentar (2014) e TACO (2011) conferidos em fontes bibliográficas/organizacionais; a TACO continua como referência de composição, não reconhecimento automático de refeições.

## F. Próximo passo exato
CI validado no commit 7f8cf42 (workflow 42479710744: 10 testes e build aprovados). Próximo passo: ampliar os testes para condições médicas, reinício de liberação autodeclarada e bloqueio de corrida; revisar contraste, leitores de tela e ordem de foco. A especificação inicial de arquitetura e LGPD está em docs/ARQUITETURA_BACKEND_LGPD.md; não há backend implementado. Manter fotos e persistência desativadas até implementação, testes de autorização e revisão jurídica/de segurança. A especificação inicial de arquitetura e LGPD está em docs/ARQUITETURA_BACKEND_LGPD.md; não há backend implementado. Manter fotos e persistência desativadas até implementação, testes de autorização e revisão jurídica/de segurança.

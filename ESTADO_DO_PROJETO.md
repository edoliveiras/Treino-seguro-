# ESTADO_DO_PROJETO — Treino Seguro
Última atualização: 2026-11-08 (testes de segurança ampliados, contraste ajustado e CI aprovado)

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
- `src/App.test.tsx`: 7 testes de interface.
- Total: **13 testes aprovados**.
- Commit dos testes: `4f34a4049402b9244f7b57ecc179e598808636d0`; workflow 42479872555: testes e build aprovados.
- Commit do ajuste de contraste: `da1785b36022bfa6dc43635e168910c2fc514f8e`; workflow 42479881418: testes e build aprovados.
- Os testes atuais cobrem: bloqueio de acesso direto ao treino, revalidação após mudanças, ocultação de exercícios após relato de dor, navegação móvel, reinício da declaração médica, bloqueio de corrida no cenário definido e exclusividade de “Nenhuma”.

## 4. Arquitetura, privacidade e limitações
- Documento de proposta: `docs/ARQUITETURA_BACKEND_LGPD.md`.
- **Não existe backend, autenticação, banco de dados, sincronização ou upload de fotos implementado.**
- Os dados digitados ficam apenas na memória da página e são perdidos ao atualizar/fechar.
- O documento LGPD é uma proposta técnica; não é implementação nem comprovação de conformidade.
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
5. **P1 — Backend seguro:** somente após decisões e revisão; autenticação, RLS, segregação por usuário, exportação e exclusão.
6. **P2 — Personalização de treinos:** considerar dias, nível, local e limitações sem prescrição automática em cenários de risco.
7. **P2 — Conteúdo multimídia licenciado:** imagens/vídeos profissionais, erros comuns e contraindicações revisadas.
8. **P2 — Nutrição:** integração confiável com TACO/Guia Alimentar; não habilitar reconhecimento por foto ou calorias sem método validado.
9. **P3 — Configurar Lovable como visualizador e planejar publicação após as revisões e serviços externos necessários.**

## 7. Próximo passo exato
Continuar pela cobertura de segurança e acessibilidade: ampliar testes de alteração de cada campo e estados de navegação; depois revisar nomes acessíveis, ordem de foco e layout móvel. Manter backend, persistência e fotos desativados. Não declarar o produto publicado, clinicamente validado ou LGPD-compliant.

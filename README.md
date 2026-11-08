# Treino Seguro

Aplicativo web educativo, mobile-first e em português para adultos. Inclui demonstração de avaliação inicial, orientações gerais de movimento, diário alimentar sem estimativas automáticas, registros temporários de evolução e referências científicas.

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

O CI também verifica componentes de segurança legados de OTP com Deno e executa as migrações de contas, consentimento e registros de saúde em um PostgreSQL temporário, com stubs mínimos de Supabase Auth. Essa simulação verifica regras SQL, mas não substitui homologação em um projeto Supabase real.

## Acessibilidade
- Atalho visível ao receber foco para pular diretamente ao conteúdo principal.
- Seção ativa anunciada por tecnologia assistiva na navegação principal e móvel.

## Segurança e limites
- Não diagnostica nem substitui médico, nutricionista ou profissional de Educação Física.
- Exclusivo para maiores de 18 anos.
- Condições de saúde informadas exigem orientação/liberação médica antes de iniciar.
- IMC é apenas triagem. IMC ≥ 35 não gera recomendação automática para corrida.
- Dor no peito, falta de ar intensa/incomum, tontura, desmaio, fraqueza/formigamento novo ou dor forte/piorando exigem interrupção e avaliação.
- Cadastro e login estão ligados ao projeto Supabase dedicado. A conta é liberada após confirmação de e-mail; o telefone informado fica apenas como contato, sem integração com aplicativos de mensagens. O aplicativo não depende de Facebook, Meta, WhatsApp ou envio de SMS.
- Avaliações, treinos, refeições, peso e medidas podem ser sincronizados na conta somente após autorização específica de dados de saúde. RLS limita leitura e gravação à própria conta, ativa e com e-mail confirmado; retirar a autorização bloqueia novas leituras/gravações. Fotos de evolução ainda não têm upload ou armazenamento habilitado.
- As telas iniciais de Termos e Política exigem revisão jurídica antes da publicação. Não use o aplicativo como serviço clínico ou para inserir dados sensíveis reais até concluir homologação e revisão.

## Fontes
- Bull FC et al. WHO 2020 guidelines. https://bjsm.bmj.com/content/54/24/1451
- Donnelly JE et al. ACSM position stand (2009). https://pubmed.ncbi.nlm.nih.gov/19127177/
- Hayden JA et al. Exercise therapy for chronic low back pain. Cochrane (2021). https://pubmed.ncbi.nlm.nih.gov/34580864/
- Ministério da Saúde. Guia Alimentar (2014). https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf
- NEPA/UNICAMP. TACO, 4ª edição (2011). https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/

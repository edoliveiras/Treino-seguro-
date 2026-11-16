# Histórico de migrações — Treino Seguro

Verificação de 16/11/2026:

- O Supabase registra 29 migrações aplicadas.
- O repositório contém 25 arquivos SQL.
- Quatro migrações aplicadas não têm o arquivo-fonte no histórico atual do repositório:
  - `20261111214532_private_food_photo_storage`
  - `20261111214904_record_optional_food_photo_consent`
  - `20261111215333_require_both_consents_for_food_photos`
  - `20261111220005_require_active_account_for_food_photo_updates`

As versões e nomes foram confirmados pela lista de migrações do banco. A busca no histórico do repositório não encontrou cópias desses arquivos.

**Não criar arquivos substitutos por suposição, não reaplicar essas migrações e não alterar o banco para tentar igualar contagens.** Recuperar os scripts originais de um backup confiável ou do ambiente de desenvolvimento que os gerou. Até lá, novas alterações devem ser aditivas, revisadas e testadas em ambiente separado.

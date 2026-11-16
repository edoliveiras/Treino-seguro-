# Histórico de migrações — Treino Seguro

Verificação de 16/11/2026:

- O Supabase registra 29 migrações aplicadas.
- O repositório agora contém os 29 arquivos SQL correspondentes.
- Quatro arquivos que faltavam foram recuperados exatamente do campo `statements` do registro `supabase_migrations.schema_migrations` do projeto Supabase:
  - `20261111214532_private_food_photo_storage.sql`
  - `20261111214904_record_optional_food_photo_consent.sql`
  - `20261111215333_require_both_consents_for_food_photos.sql`
  - `20261111220005_require_active_account_for_food_photo_updates.sql`

A recuperação foi somente de código-fonte. **Essas migrações não foram reaplicadas e o banco não foi alterado.** O teste SQL automatizado foi atualizado para carregar os 29 arquivos em PostgreSQL temporário com stubs mínimos de Supabase Auth e Storage. O resultado desse teste continua sendo simulado e não substitui a homologação no Supabase real.

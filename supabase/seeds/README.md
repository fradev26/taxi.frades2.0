# Seed & Migration helper (Supabase)

Dit bestand bevat korte instructies om de SQL seed- en migratie-workflows in deze repository te gebruiken. Gebruik deze stappen om `app_settings` (inclusief `pricing_overrides`) veilig naar je database te sturen.

BELANGRIJK: voer altijd eerst een backup uit voordat je migraties toepast. Gebruik production secrets alleen in veilige CI-omgevingen (GitHub Actions secrets).

## Bestanden
- `supabase/seeds/seed_app_settings_and_pricing.sql` — één bestand met setup/beleid en een `pricing_overrides` JSON blob (klaar om te plakken in de Supabase SQL editor of via psql uit te voeren).
- `.github/workflows/seed_app_settings.yml` — workflow om het seed SQL op een database uit te voeren via `psql` using `PG_CONNECTION_STRING` secret.
- `.github/workflows/apply_migrations.yml` — workflow die alle SQL files in `supabase/migrations/` in chronologische volgorde uitvoert (met pre-migration backup).
- `.github/workflows/migrate_staging_then_production.yml` — workflow die eerst staging migreert en, na handmatige goedkeuring via het `production` environment, production backup + migraties uitvoert.

## Vereiste secrets
- `PG_CONNECTION_STRING` — Postgres connection string voor productie (gebruik service-role user of admin). Bijvoorbeeld: `postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require`.
- `PG_CONNECTION_STRING_STAGING` — (optioneel) staging connection string.

Voeg deze toe via GitHub → Settings → Secrets and variables → Actions → New repository secret.

## Seed workflow (handmatig via GitHub Actions)
1. Controleer `supabase/seeds/seed_app_settings_and_pricing.sql` en pas waarden aan indien nodig.
2. Ga naar GitHub → Actions → "Seed app_settings and pricing" → Run workflow.
3. Vul optioneel de `pgconn` input in om een alternatieve connection string te gebruiken (anders wordt `PG_CONNECTION_STRING` gebruikt).

## Migraties toepassen
1. Run `.github/workflows/apply_migrations.yml` handmatig of gebruik `migrate_staging_then_production.yml` voor een staging → production flow.
2. Zorg dat de repository secrets ingesteld zijn (`PG_CONNECTION_STRING_STAGING`, `PG_CONNECTION_STRING`).
3. De `migrate_staging_then_production.yml` workflow vereist een approval stap (Production environment). Stel required reviewers in op het `production` environment in je repo-instellingen.

## Backup en herstel
- De migratie-workflow maakt vóór migraties automatisch een `pg_dump` en uploadt het als artifact.
- Download het artifact vanuit de Actions-run en bewaar het veilig (S3, interne opslag).
- Herstel (voorbeeld lokaal):
```bash
# Restore using pg_restore (bewaar DB_URL als env var):
# psql "postgresql://user:pass@host:5432/dbname" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# pg_restore --verbose --clean --no-acl --no-owner -d "postgresql://user:pass@host:5432/dbname" your_backup.dump
```

## Lokaal testen met psql
Als je lokale machine toegang heeft tot de DB en `psql/pg_dump` geïnstalleerd zijn:
```bash
# Run the seed SQL file locally
PGCONN="postgresql://user:pass@host:5432/dbname?sslmode=require"
psql "$PGCONN" -f supabase/seeds/seed_app_settings_and_pricing.sql
```

TIP: installeer de Postgres client op Debian/Ubuntu:
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

## Veiligheids- en governance tips
- Gebruik een service-role of admin connection string **alleen** in CI secrets; nooit in client-side code.
- Test migraties en seeds altijd eerst op staging.
- Beperk wie het `production` environment mag goedkeuren in GitHub settings.

Als je wilt, kan ik deze README uitbreiden met voorbeelden voor het automatisch uploaden van backups naar S3 of met een playbook voor rollbacks.

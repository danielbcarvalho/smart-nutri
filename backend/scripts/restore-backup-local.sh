#!/bin/bash
# Salve como backend/scripts/restore-backup-local.sh
# Torne executável: chmod +x backend/scripts/restore-backup-local.sh

if [ -z "$1" ]; then
  echo "Uso: $0 arquivo_de_backup.backup"
  exit 1
fi

ARQUIVO="$1"
DB_LOCAL="smartnutri_db"
USUARIO_LOCAL="postgres"

echo "Restaurando backup $ARQUIVO no banco local $DB_LOCAL ..."

dropdb -U $USUARIO_LOCAL $DB_LOCAL
createdb -U $USUARIO_LOCAL $DB_LOCAL

pg_restore --no-owner --no-privileges --dbname=$DB_LOCAL "$ARQUIVO"

if [ $? -eq 0 ]; then
  echo "Backup restaurado com sucesso em $DB_LOCAL"
else
  echo "Erro ao restaurar backup!"
fi 
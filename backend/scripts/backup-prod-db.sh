#!/bin/bash
# Salve como backend/scripts/backup-prod-db.sh
# Torne executável: chmod +x backend/scripts/backup-prod-db.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Erro: Defina a variável DATABASE_URL com a string de conexão do Railway."
  exit 1
fi

DATA=$(date +%Y-%m-%d_%H-%M-%S)
ARQUIVO="backup_producao_railway_$DATA.backup"

echo "Gerando backup do banco de produção para $ARQUIVO ..."
pg_dump --clean --if-exists --no-owner --no-privileges --format=custom --dbname="$DATABASE_URL" > "$ARQUIVO"

if [ $? -eq 0 ]; then
  echo "Backup gerado com sucesso: $ARQUIVO"
else
  echo "Erro ao gerar backup!"
fi 
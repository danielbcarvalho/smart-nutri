#!/bin/bash
# Script para backup do banco de dados de produção do Railway
# Torne executável: chmod +x backend/scripts/backup-prod-db.sh

# Configurações do banco de dados
HOST="crossover.proxy.rlwy.net"
PORT="31832"
USER="postgres"
DB="railway"
PASSWORD="sxcDBybUWEZHidOMWuVxphPPzbpRuEhb"

# Cria o diretório de backup se não existir
BACKUP_DIR="../backups"
mkdir -p $BACKUP_DIR

# Nome do arquivo de backup com timestamp
DATA=$(date +%Y-%m-%d_%H-%M-%S)
ARQUIVO="$BACKUP_DIR/backup_producao_railway_$DATA.backup"

echo "Gerando backup do banco de produção para $ARQUIVO ..."
PGPASSWORD=$PASSWORD pg_dump -h $HOST -p $PORT -U $USER -d $DB --clean --if-exists --no-owner --no-privileges --format=custom -f "$ARQUIVO"

if [ $? -eq 0 ]; then
  echo "Backup gerado com sucesso: $ARQUIVO"
else
  echo "Erro ao gerar backup!"
fi
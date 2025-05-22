#!/bin/bash
# Script para restaurar backup no banco de dados local
# Torne executável: chmod +x backend/scripts/restore-local-db.sh

# Configurações do banco de dados local
HOST="localhost"
PORT="5432"
USER="postgres"
DB="smartnutri_db"
PASSWORD="smartnutri"

# Função para encontrar o backup mais recente
find_latest_backup() {
    local backup_dir="../backups"
    # Encontra o backup mais recente com o padrão backup_producao_railway_*.backup
    local latest_backup=$(ls -t "$backup_dir"/backup_producao_railway_*.backup 2>/dev/null | head -n 1)
    
    if [ -z "$latest_backup" ]; then
        echo "Erro: Nenhum arquivo de backup encontrado em $backup_dir"
        exit 1
    fi
    
    echo "$latest_backup"
}

# Se nenhum arquivo for fornecido, usa o mais recente
if [ -z "$1" ]; then
    echo "Nenhum arquivo de backup especificado. Procurando o backup mais recente..."
    BACKUP_FILE=$(find_latest_backup)
    echo "Backup mais recente encontrado: $BACKUP_FILE"
else
    BACKUP_FILE="$1"
fi

# Verifica se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Mostra informações do backup
echo "📊 Informações do backup:"
echo "Arquivo: $BACKUP_FILE"
echo "Tamanho: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "Data de modificação: $(date -r "$BACKUP_FILE" "+%d/%m/%Y %H:%M:%S")"

echo -e "\n🔄 Iniciando restauração local..."

# Primeiro, tenta dropar o banco se existir
echo "🗑️  Removendo banco de dados local se existir..."
PGPASSWORD=$PASSWORD dropdb -h $HOST -p $PORT -U $USER --if-exists $DB

# Cria o banco novamente
echo "📦 Criando banco de dados local..."
PGPASSWORD=$PASSWORD createdb -h $HOST -p $PORT -U $USER $DB

# Restaura o backup
echo "�� Restaurando backup..."
PGPASSWORD=$PASSWORD pg_restore -h $HOST -p $PORT -U $USER -d $DB --clean --if-exists --no-owner --no-privileges "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "\n✅ Backup restaurado com sucesso localmente!"
    echo "📝 Detalhes da restauração:"
    echo "- Banco: $DB"
    echo "- Host: $HOST"
    echo "- Data/Hora: $(date "+%d/%m/%Y %H:%M:%S")"
else
    echo -e "\n❌ Erro ao restaurar backup!"
    echo "Verifique os logs acima para mais detalhes."
fi
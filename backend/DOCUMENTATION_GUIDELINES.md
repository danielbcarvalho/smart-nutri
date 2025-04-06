# Diretrizes de Documentação da API

## Regras para Desenvolvimento

### 1. Antes de Iniciar uma Nova Feature

1. **Consultar a Documentação Existente**

   - Ler o arquivo `API_DOCUMENTATION.md` completamente
   - Identificar endpoints similares que possam servir como referência
   - Verificar os modelos de dados existentes
   - Entender os padrões de nomenclatura e estrutura

2. **Planejamento**
   - Documentar os novos endpoints que serão criados
   - Definir os modelos de dados necessários
   - Planejar as respostas de sucesso e erro
   - Identificar possíveis conflitos com funcionalidades existentes

### 2. Durante o Desenvolvimento

1. **Manter Consistência**

   - Seguir os mesmos padrões de documentação existentes
   - Usar os mesmos formatos para respostas de erro
   - Manter a mesma estrutura de endpoints

2. **Documentar em Tempo Real**
   - Atualizar o `API_DOCUMENTATION.md` conforme desenvolve
   - Não deixar a documentação para o final

### 3. Após o Desenvolvimento

1. **Revisão da Documentação**

   - Verificar se todos os novos endpoints estão documentados
   - Confirmar se os exemplos de requisição e resposta estão corretos
   - Validar se os códigos de erro estão documentados
   - Checar se os modelos de dados estão atualizados

2. **Atualização Final**
   - Atualizar o `API_DOCUMENTATION.md` com todas as mudanças
   - Adicionar exemplos de uso
   - Documentar casos de erro específicos
   - Atualizar a versão da API se necessário

## Checklist de Documentação

### Para Novas Features

- [ ] Consultar `API_DOCUMENTATION.md` antes de começar
- [ ] Documentar novos endpoints
- [ ] Adicionar novos modelos de dados
- [ ] Incluir exemplos de requisição e resposta
- [ ] Documentar códigos de erro específicos
- [ ] Atualizar a versão da API se necessário

### Para Modificações em Features Existentes

- [ ] Consultar a documentação atual do endpoint
- [ ] Identificar o que será modificado
- [ ] Atualizar a documentação existente
- [ ] Manter compatibilidade com versões anteriores
- [ ] Documentar mudanças breaking changes
- [ ] Atualizar exemplos se necessário

## Formato da Documentação

1. **Endpoints**

   ```markdown
   #### Nome do Endpoint

   - **Método** `/caminho`
   - **Descrição**: Descrição clara da funcionalidade
   - **Corpo da Requisição**: Exemplo em JSON
   - **Respostas**: Lista de códigos HTTP e significados
   ```

2. **Modelos de Dados**

   ```typescript
   {
     campo: tipo; // Descrição do campo
   }
   ```

3. **Códigos de Erro**
   ```markdown
   - **Código**: Descrição do erro
   ```

## Processo de Review

1. **Code Review**

   - Verificar se a documentação foi atualizada
   - Confirmar se os exemplos estão funcionando
   - Validar se as mudanças estão claras

2. **Merge**
   - Não permitir merge sem documentação atualizada
   - Verificar se a documentação está no mesmo PR
   - Confirmar se os testes documentam os casos de uso

## Manutenção

1. **Atualizações Regulares**

   - Revisar a documentação a cada sprint
   - Remover endpoints obsoletos
   - Atualizar exemplos desatualizados
   - Manter a documentação sincronizada com o código

2. **Versionamento**
   - Documentar breaking changes
   - Manter histórico de versões
   - Indicar depreciação de endpoints

## Ferramentas e Recursos

1. **Swagger/OpenAPI**

   - Manter a documentação Swagger atualizada
   - Usar decorators apropriados
   - Gerar documentação automática

2. **Testes**
   - Documentar casos de teste
   - Manter exemplos de uso atualizados
   - Incluir testes de documentação

## Contato e Suporte

Para dúvidas sobre documentação ou sugestões de melhoria, entre em contato com a equipe de desenvolvimento.

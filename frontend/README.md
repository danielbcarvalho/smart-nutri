# SmartNutri Frontend

Sistema de gestão para nutricionistas, desenvolvido com React, TypeScript e Material-UI.

## 🚀 Começando

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- Backend rodando localmente (ver instruções no `/backend/README.md`)

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📚 Documentação

### Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── layouts/       # Layouts da aplicação
├── pages/         # Páginas/rotas da aplicação
├── services/      # Serviços e chamadas API
├── types/         # Tipos TypeScript
├── utils/         # Utilitários e helpers
└── theme/         # Configuração do tema Material-UI
```

### Features Principais

Veja o arquivo [FEATURES.md](./FEATURES.md) para documentação detalhada de todas as features.

### Convenções e Boas Práticas

1. **Componentes**

   - Use TypeScript para todos os componentes
   - Prefira componentes funcionais com hooks
   - Documente props com interfaces TypeScript

2. **Estado**

   - Use React Query para estado do servidor
   - Use useState/useContext para estado local
   - Evite prop drilling, prefira Context

3. **Estilização**

   - Use o sistema de tema do Material-UI
   - Evite CSS inline, prefira `sx` prop
   - Mantenha consistência com o Design System

4. **Rotas**
   - Organize rotas em `App.tsx`
   - Use layouts para estruturas comuns
   - Implemente lazy loading quando necessário

## 🔄 Fluxo de Trabalho

### Adicionando Novas Features

1. Verifique [FEATURES.md](./FEATURES.md) para features existentes
2. Atualize a documentação antes de começar
3. Siga as convenções de código estabelecidas
4. Atualize testes quando necessário

### Modificando Features Existentes

1. Consulte a documentação em [FEATURES.md](./FEATURES.md)
2. Atualize a documentação com as mudanças
3. Mantenha a retrocompatibilidade quando possível
4. Documente breaking changes

## 🧪 Testes

```bash
# Rodar testes
npm test

# Rodar testes com coverage
npm run test:coverage
```

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🤝 Contribuindo

1. Verifique a documentação existente
2. Siga o guia de estilo e convenções
3. Faça testes antes de submeter mudanças
4. Atualize a documentação quando necessário

## 📝 Notas de Versão

Veja [CHANGELOG.md](./CHANGELOG.md) para histórico de mudanças.

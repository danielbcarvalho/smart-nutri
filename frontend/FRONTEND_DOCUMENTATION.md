# SmartNutri Frontend Documentation

## Visão Geral

Frontend da aplicação SmartNutri, desenvolvido com React e TypeScript, utilizando:

- Material-UI para componentes
- React Query para gerenciamento de estado e cache
- React Router para navegação
- Axios para requisições HTTP

## Estrutura do Projeto

### Diretórios Principais

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços de API
├── hooks/         # Custom hooks
├── contexts/      # Contextos React
├── types/         # Definições de tipos TypeScript
├── utils/         # Funções utilitárias
└── assets/        # Recursos estáticos
```

## Componentes Principais

### Layout

- `MainLayout`: Layout principal da aplicação
  - Header com navegação
  - Sidebar com menu
  - Área de conteúdo principal

### Páginas

1. **Dashboard**

   - Visão geral do sistema
   - Cards com informações importantes
   - Gráficos e estatísticas

2. **Pacientes**

   - Lista de pacientes
   - Formulário de cadastro/edição
   - Detalhes do paciente
   - Histórico de avaliações

3. **Planos Alimentares**

   - Lista de planos
   - Criação/edição de planos
   - Visualização detalhada
   - Adição de refeições

4. **Alimentos**
   - Lista de alimentos
   - Busca e filtros
   - Cadastro manual
   - Importação da API

## Padrões de Desenvolvimento

### 1. Componentes

- Usar functional components
- Implementar TypeScript
- Seguir princípios de componentização
- Documentar props com JSDoc

Exemplo:

```typescript
interface ButtonProps {
  /** Texto do botão */
  label: string;
  /** Função chamada ao clicar */
  onClick: () => void;
  /** Variante do botão */
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
}) => {
  // ...
};
```

### 2. Estado e Dados

- Usar React Query para dados do servidor
- Context API para estado global
- Local state para estado de UI
- Custom hooks para lógica reutilizável

### 3. Estilização

- Usar Material-UI
- Seguir tema da aplicação
- Manter consistência visual
- Usar styled-components quando necessário

### 4. Formulários

- Usar React Hook Form
- Implementar validação com Yup
- Manter feedback visual
- Tratar erros adequadamente

## Checklist para Novas Features

### 1. Planejamento

- [ ] Consultar documentação existente
- [ ] Identificar componentes similares
- [ ] Planejar estrutura de dados
- [ ] Definir fluxo de usuário

### 2. Desenvolvimento

- [ ] Criar tipos TypeScript
- [ ] Implementar componentes
- [ ] Adicionar testes
- [ ] Documentar props e funções

### 3. Integração

- [ ] Integrar com API
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states
- [ ] Testar em diferentes dispositivos

### 4. Documentação

- [ ] Atualizar este documento
- [ ] Documentar novos componentes
- [ ] Adicionar exemplos de uso
- [ ] Atualizar tipos globais

## Boas Práticas

### 1. Performance

- Implementar lazy loading
- Otimizar re-renders
- Usar memoização quando necessário
- Minimizar bundle size

### 2. Acessibilidade

- Usar roles ARIA
- Implementar navegação por teclado
- Manter contraste adequado
- Testar com leitores de tela

### 3. Testes

- Testes unitários para componentes
- Testes de integração
- Testes de fluxo
- Testes de acessibilidade

### 4. Código

- Seguir ESLint
- Usar Prettier
- Manter código limpo
- Documentar funções complexas

## Fluxos Principais

### 1. Cadastro de Paciente

1. Acessar lista de pacientes
2. Clicar em "Novo Paciente"
3. Preencher formulário
4. Validar dados
5. Salvar e redirecionar

### 2. Criação de Plano Alimentar

1. Selecionar paciente
2. Criar novo plano
3. Adicionar refeições
4. Definir alimentos
5. Salvar e visualizar

### 3. Busca de Alimentos

1. Acessar lista de alimentos
2. Usar barra de busca
3. Filtrar resultados
4. Selecionar alimento
5. Ver detalhes

## Manutenção

### 1. Atualizações

- Manter dependências atualizadas
- Remover código não utilizado
- Otimizar performance
- Atualizar documentação

### 2. Debugging

- Usar React DevTools
- Implementar logging
- Monitorar erros
- Testar em diferentes browsers

## Recursos e Referências

### 1. Documentação

- [Material-UI](https://mui.com/)
- [React Query](https://react-query.tanstack.com/)
- [React Router](https://reactrouter.com/)
- [TypeScript](https://www.typescriptlang.org/)

### 2. Ferramentas

- React DevTools
- Chrome DevTools
- VS Code Extensions
- Testing Tools

## Contato e Suporte

Para dúvidas sobre o frontend ou sugestões de melhoria, entre em contato com a equipe de desenvolvimento.

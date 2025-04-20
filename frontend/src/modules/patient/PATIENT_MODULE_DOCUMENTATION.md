# Módulo de Pacientes (`src/modules/patient`)

Este módulo centraliza toda a lógica, páginas, componentes e integrações relacionadas ao gerenciamento de pacientes no SmartNutri.

---

## 📁 Estrutura do Módulo

```
src/modules/patients/
├── pages/
│   ├── Patients/           # Página de listagem e ações de pacientes
│   │   └── PatientsPage.tsx
│   ├── PatientInfo/        # Página de detalhes do paciente
│   │   └── PatientInfoPage.tsx
├── services/
│   └── patientService.ts   # Funções de API, tipos e integrações de pacientes
├── components/
│   ├── PatientsTable.tsx           # Tabela de pacientes reutilizável
│   ├── PatientActionsMenu.tsx      # Menu de ações para cada paciente
│   └── DeleteConfirmationDialog.tsx# Diálogo de confirmação de exclusão
```

---

## 🧩 Principais Componentes

- **PatientsTable**: Tabela reutilizável para exibir pacientes, com ações de editar, excluir e visualizar.
- **PatientActionsMenu**: Menu contextual para ações rápidas em cada paciente.
- **DeleteConfirmationDialog**: Diálogo padrão para confirmação de exclusão.

---

## 🗂️ Serviços

- **patientService.ts**:  
  Contém todas as funções de integração com a API de pacientes (CRUD, medições, upload de foto, etc) e os principais tipos TypeScript do domínio.

---

## 🖥️ Páginas

- **PatientsPage.tsx**:  
  Página principal de listagem, busca, ordenação, criação e exclusão de pacientes.  
  Utiliza o modal `PatientFormModal` (componente global) para cadastro/edição.

- **PatientInfoPage.tsx**:  
  Página de detalhes do paciente, exibe informações completas, foto, botões de ação e permite edição via modal.

---

## 🛠️ Como usar/importar

Sempre utilize os **aliases** do projeto:

```ts
import { patientService } from "@modules/patients/services/patientService";
import { PatientsTable } from "@modules/patients/components/PatientsTable";
```

Para abrir o modal de cadastro/edição de paciente, use o componente global:

```ts
import { PatientFormModal } from "@components/PatientForm/PatientFormModal";
```

---

## 🚦 Fluxos e Padrões

- **Criação/Edição**: Sempre via modal (`PatientFormModal`), nunca por navegação de rota.
- **Atualização instantânea**: Após editar/cadastrar, a lista e os dados são atualizados automaticamente via React Query.
- **Fotos**: Upload e exibição de fotos de perfil são feitos via endpoints REST do backend.
- **Ações**: Todas as ações (editar, excluir, visualizar) são acessíveis via menus/contexto na tabela.

---

## 🧑‍💻 Boas Práticas

- Use sempre os aliases para imports.
- Siga o padrão de nomenclatura de páginas e componentes.
- Componentes do módulo devem ser específicos do domínio de pacientes.
- Tipos e integrações de API ficam em `services/patientService.ts`.
- Atualize este README sempre que adicionar ou alterar funcionalidades relevantes.

---

## 📝 Checklist para contribuir

- [ ] Criei/editei arquivos dentro de `src/modules/patients/`
- [ ] Usei aliases para todos os imports
- [ ] Segui o padrão de nomenclatura de páginas/componentes
- [ ] Testei o fluxo principal (listagem, cadastro, edição, exclusão)
- [ ] Atualizei este README se necessário

---

## 📚 Referências

- [Documentação geral do frontend](../../FRONTEND_DOCUMENTATION.md)
- [Material-UI](https://mui.com/)
- [React Query](https://react-query.tanstack.com/)

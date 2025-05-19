import { Box, Divider, Typography } from "@mui/material";
import { DesignSystemTypography } from "../Typography/TypographyVariants";
import { DesignSystemButton } from "../Button/ButtonVariants";
import { DesignSystemCard } from "../Card/CardVariants";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { DesignSystemInput } from "../Form/InputVariants";
import { DesignSystemSelect } from "../Form/SelectVariants";
import { DesignSystemSnackbar } from "../Feedback/SnackbarVariants";
import { useState } from "react";

export const DesignSystemPreview = () => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const handleShowSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1 }}>
      {/* Tipografia Preview */}
      <Box sx={{ mb: 4 }}>
        <DesignSystemTypography variant="sectionTitle">
          Tipografia
        </DesignSystemTypography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DesignSystemTypography variant="pageTitle">
            Título da Página
          </DesignSystemTypography>
          <DesignSystemTypography variant="sectionTitle">
            Seção Principal
          </DesignSystemTypography>
          <DesignSystemTypography variant="cardTitle">
            Título do Card
          </DesignSystemTypography>
          <DesignSystemTypography variant="bodyText">
            Texto do corpo da página. Este é um exemplo de texto que demonstra
            como o corpo do texto será exibido na aplicação.
          </DesignSystemTypography>
          <DesignSystemTypography variant="caption">
            Texto secundário ou legenda
          </DesignSystemTypography>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Botões Preview */}
      <Box sx={{ mb: 4 }}>
        <DesignSystemTypography variant="sectionTitle">
          Botões
        </DesignSystemTypography>

        {/* Botões Básicos */}
        <Box sx={{ mb: 3 }}>
          <DesignSystemTypography variant="cardTitle" sx={{ mb: 2 }}>
            Botões Básicos
          </DesignSystemTypography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <DesignSystemButton variant="primary">
              Botão Principal
            </DesignSystemButton>
            <DesignSystemButton variant="secondary">
              Botão Secundário
            </DesignSystemButton>
            <DesignSystemButton variant="text">Botão Texto</DesignSystemButton>
          </Box>
        </Box>

        {/* Botões com Ícones */}
        <Box sx={{ mb: 3 }}>
          <DesignSystemTypography variant="cardTitle" sx={{ mb: 2 }}>
            Botões com Ícones
          </DesignSystemTypography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <DesignSystemButton variant="primary" startIcon={<AddIcon />}>
              Novo Item
            </DesignSystemButton>
            <DesignSystemButton variant="secondary" startIcon={<EditIcon />}>
              Editar
            </DesignSystemButton>
            <DesignSystemButton variant="text" startIcon={<DeleteIcon />}>
              Excluir
            </DesignSystemButton>
          </Box>
        </Box>

        {/* Botões de Ícone */}
        <Box>
          <DesignSystemTypography variant="cardTitle" sx={{ mb: 2 }}>
            Botões de Ícone
          </DesignSystemTypography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <DesignSystemButton variant="icon">
              <SearchIcon />
            </DesignSystemButton>
            <DesignSystemButton variant="icon">
              <EditIcon />
            </DesignSystemButton>
            <DesignSystemButton variant="icon">
              <DeleteIcon />
            </DesignSystemButton>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Cards Preview */}
      <Box sx={{ mb: 4 }}>
        <DesignSystemTypography variant="sectionTitle">
          Cards
        </DesignSystemTypography>

        {/* Cards Básicos */}
        <Box sx={{ mb: 3 }}>
          <DesignSystemTypography variant="cardTitle" sx={{ mb: 2 }}>
            Cards Básicos
          </DesignSystemTypography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <DesignSystemCard variant="default">
              <DesignSystemTypography variant="cardTitle">
                Card Padrão
              </DesignSystemTypography>
              <DesignSystemTypography variant="bodyText">
                Este é um exemplo de card padrão com sombra suave.
              </DesignSystemTypography>
            </DesignSystemCard>

            <DesignSystemCard variant="elevated">
              <DesignSystemTypography variant="cardTitle">
                Card Elevado
              </DesignSystemTypography>
              <DesignSystemTypography variant="bodyText">
                Este é um exemplo de card com sombra mais pronunciada.
              </DesignSystemTypography>
            </DesignSystemCard>

            <DesignSystemCard variant="outlined">
              <DesignSystemTypography variant="cardTitle">
                Card com Borda
              </DesignSystemTypography>
              <DesignSystemTypography variant="bodyText">
                Este é um exemplo de card com borda e sem sombra.
              </DesignSystemTypography>
            </DesignSystemCard>
          </Box>
        </Box>

        {/* Cards com Ações */}
        <Box>
          <DesignSystemTypography variant="cardTitle" sx={{ mb: 2 }}>
            Cards com Ações
          </DesignSystemTypography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <DesignSystemCard
              variant="default"
              title={
                <DesignSystemTypography variant="cardTitle">
                  Card com Título
                </DesignSystemTypography>
              }
              subtitle={
                <DesignSystemTypography variant="caption">
                  Subtítulo do card
                </DesignSystemTypography>
              }
              actions={
                <>
                  <DesignSystemButton variant="icon">
                    <EditIcon />
                  </DesignSystemButton>
                  <DesignSystemButton variant="icon">
                    <DeleteIcon />
                  </DesignSystemButton>
                </>
              }
            >
              <DesignSystemTypography variant="bodyText">
                Este é um exemplo de card com título, subtítulo e ações.
              </DesignSystemTypography>
            </DesignSystemCard>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Cores Preview */}
      <Box>
        <DesignSystemTypography variant="sectionTitle">
          Cores
        </DesignSystemTypography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.contrastText",
            }}
          >
            Primary
          </Box>
          <Box
            sx={{
              width: 100,
              height: 100,
              bgcolor: "secondary.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "secondary.contrastText",
            }}
          >
            Secondary
          </Box>
          <Box
            sx={{
              width: 100,
              height: 100,
              bgcolor: "success.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "success.contrastText",
            }}
          >
            Success
          </Box>
          <Box
            sx={{
              width: 100,
              height: 100,
              bgcolor: "error.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "error.contrastText",
            }}
          >
            Error
          </Box>
        </Box>
      </Box>

      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Formulários
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Inputs
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <DesignSystemInput
              label="Input Padrão"
              placeholder="Digite algo..."
            />
            <DesignSystemInput
              variant="filled"
              label="Input Preenchido"
              placeholder="Digite algo..."
            />
            <DesignSystemInput
              variant="outlined"
              label="Input com Borda"
              placeholder="Digite algo..."
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selects
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <DesignSystemSelect
              label="Select Padrão"
              options={[
                { value: "1", label: "Opção 1" },
                { value: "2", label: "Opção 2" },
                { value: "3", label: "Opção 3" },
              ]}
            />
            <DesignSystemSelect
              variant="filled"
              label="Select Preenchido"
              options={[
                { value: "1", label: "Opção 1" },
                { value: "2", label: "Opção 2" },
                { value: "3", label: "Opção 3" },
              ]}
            />
            <DesignSystemSelect
              variant="outlined"
              label="Select com Borda"
              options={[
                { value: "1", label: "Opção 1" },
                { value: "2", label: "Opção 2" },
                { value: "3", label: "Opção 3" },
              ]}
            />
          </Box>
        </Box>
      </Box>

      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Feedback
      </Typography>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Snackbars
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <DesignSystemButton
            variant="primary"
            color="success"
            onClick={() =>
              handleShowSnackbar("Operação realizada com sucesso!", "success")
            }
          >
            Mostrar Sucesso
          </DesignSystemButton>
          <DesignSystemButton
            variant="primary"
            color="error"
            onClick={() => handleShowSnackbar("Ocorreu um erro!", "error")}
          >
            Mostrar Erro
          </DesignSystemButton>
          <DesignSystemButton
            variant="primary"
            color="warning"
            onClick={() => handleShowSnackbar("Atenção!", "warning")}
          >
            Mostrar Alerta
          </DesignSystemButton>
          <DesignSystemButton
            variant="primary"
            color="info"
            onClick={() => handleShowSnackbar("Informação importante", "info")}
          >
            Mostrar Info
          </DesignSystemButton>
        </Box>
      </Box>

      <DesignSystemSnackbar
        open={showSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setShowSnackbar(false)}
        autoHideDuration={3000}
      />
    </Box>
  );
};

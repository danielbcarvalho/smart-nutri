import {
  Box,
  Modal,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    logoUrl?: string;
    colorPalette?: ColorPalette;
  } | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColorPaletteChange?: (palette: ColorPalette) => void;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NutritionistSettingsModal({
  open,
  onClose,
  user,
  onLogoChange,
  onColorPaletteChange,
}: Props) {
  const [tabValue, setTabValue] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    user?.logoUrl
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(
    user?.colorPalette || {
      primary: "#1976d2",
      secondary: "#dc004e",
      accent: "#4caf50",
    }
  );
  const [selectedColorType, setSelectedColorType] = useState<
    keyof ColorPalette | null
  >(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const validateLogo = (file: File): string | null => {
    if (!file) return "Nenhum arquivo selecionado";

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return "O arquivo deve ter menos de 2MB";
    }

    // Validar formato
    const validTypes = ["image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return "Formato inválido. Aceitos: PNG, SVG";
    }

    return null;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const validationError = validateLogo(file);

    if (validationError) {
      setLogoError(validationError);
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
      return;
    }

    setLogoError(null);
    setLogoUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onLogoChange?.(e);
      setSnackbar({
        open: true,
        message: "Logo atualizado com sucesso!",
        severity: "success",
      });
    } catch (err) {
      setLogoError("Erro ao processar o arquivo");
      setSnackbar({
        open: true,
        message: "Erro ao processar o arquivo",
        severity: "error",
      });
      console.error("Erro ao processar logo:", err);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleColorChange = (color: string, type: keyof ColorPalette) => {
    const newPalette = { ...colorPalette, [type]: color };
    setColorPalette(newPalette);
    onColorPaletteChange?.(newPalette);
    setSelectedColorType(null);
    setSnackbar({
      open: true,
      message: "Cor atualizada com sucesso!",
      severity: "success",
    });
  };

  const getColorLabel = (type: keyof ColorPalette): string => {
    switch (type) {
      case "primary":
        return "Cor Principal";
      case "secondary":
        return "Cor Secundária";
      case "accent":
        return "Cor de Destaque";
      default:
        return type;
    }
  };

  const getColorDescription = (type: keyof ColorPalette): string => {
    switch (type) {
      case "primary":
        return "Usada em botões e elementos principais";
      case "secondary":
        return "Usada em elementos secundários e hover";
      case "accent":
        return "Usada em destaques e elementos de sucesso";
      default:
        return "";
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          width: 600,
          maxWidth: "90vw",
          borderRadius: 2,
          boxShadow: 24,
          mx: "auto",
          my: "10vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Configurações
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="configurações tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Aparência" />
            <Tab label="Arquivos" disabled />
            <Tab label="Formulários" disabled />
            <Tab label="Outros" disabled />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ px: 3 }}>
          {/* Aparência */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Personalização
              </Typography>
              <Tooltip title="Personalize a aparência da sua clínica">
                <InfoIcon fontSize="small" color="action" />
              </Tooltip>
            </Box>

            {/* Logo Upload */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Logo da Clínica
                </Typography>
                <Tooltip title="Adicione o logo da sua clínica em formato PNG ou SVG">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  mx: "auto",
                  border: "1px dashed",
                  borderColor: logoError ? "error.main" : "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {logoPreview ? (
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Logo da clínica"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <PhotoCameraIcon />
                  </Box>
                )}
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    width: 32,
                    height: 32,
                  }}
                  disabled={logoUploading}
                >
                  <PhotoCameraIcon fontSize="small" />
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={handleLogoChange}
                    disabled={logoUploading}
                  />
                </IconButton>
                {logoUploading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 2,
                    }}
                  />
                )}
              </Box>
              {logoError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {logoError}
                </Alert>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                PNG ou SVG, até 2MB
              </Typography>
            </Box>

            {/* Color Palette */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Paleta de Cores
                </Typography>
                <Tooltip title="Personalize as cores da sua clínica">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {Object.entries(colorPalette).map(([type, color]) => (
                  <Box
                    key={type}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color,
                        border: "1px solid",
                        borderColor:
                          selectedColorType === type
                            ? "primary.main"
                            : "divider",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "scale(1.1)",
                          boxShadow: 1,
                        },
                      }}
                      onClick={() => {
                        setSelectedColorType(type as keyof ColorPalette);
                        const input = document.createElement("input");
                        input.type = "color";
                        input.value = color;
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          handleColorChange(
                            target.value,
                            type as keyof ColorPalette
                          );
                        };
                        input.click();
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getColorLabel(type as keyof ColorPalette)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Color Preview */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: colorPalette.primary }}
                  >
                    Botão Principal
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: colorPalette.secondary,
                      color: colorPalette.secondary,
                      "&:hover": {
                        borderColor: colorPalette.secondary,
                        bgcolor: `${colorPalette.secondary}10`,
                      },
                    }}
                  >
                    Botão Secundário
                  </Button>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: `${colorPalette.accent}10`,
                      color: colorPalette.accent,
                      border: "1px solid",
                      borderColor: colorPalette.accent,
                    }}
                  >
                    Elemento de Destaque
                  </Box>
                </Box>
              </Box>

              {/* Color Descriptions */}
              <Box sx={{ mt: 2 }}>
                {Object.entries(colorPalette).map(([type, color]) => (
                  <Box
                    key={type}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 0.5,
                        bgcolor: color,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getColorDescription(type as keyof ColorPalette)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </TabPanel>

          {/* Arquivos (placeholder) */}
          <TabPanel value={tabValue} index={1}>
            <Typography>Em breve: Gerenciamento de arquivos</Typography>
          </TabPanel>

          {/* Formulários (placeholder) */}
          <TabPanel value={tabValue} index={2}>
            <Typography>Em breve: Gerenciamento de formulários</Typography>
          </TabPanel>

          {/* Outros (placeholder) */}
          <TabPanel value={tabValue} index={3}>
            <Typography>Em breve: Outras configurações</Typography>
          </TabPanel>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onClose}>
            Salvar
          </Button>
        </Box>

        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
}

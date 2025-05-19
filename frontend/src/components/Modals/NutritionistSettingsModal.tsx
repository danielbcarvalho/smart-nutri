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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Collapse,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoIcon from "@mui/icons-material/Info";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import { alpha } from "@mui/material/styles";
import { useTheme } from "../../theme/ThemeContext";
import { DesignSystemPreview } from "../DesignSystem/Preview/DesignSystemPreview";
import { useLogo } from "../../contexts/LogoContext";
import { DesignSystemCallout } from "../DesignSystem/Callout/Callout";
import { api } from "../../services/api";

type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
  } | null;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

// Lista de fontes disponíveis do Google Fonts
const availableFonts = [
  { name: "Inter", value: "Inter" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Nunito", value: "Nunito" },
  { name: "Raleway", value: "Raleway" },
  { name: "Ubuntu", value: "Ubuntu" },
];

export default function NutritionistSettingsModal({
  open,
  onClose,
  user,
  onLogoChange,
}: Props) {
  const { customColors, customFonts, updateColors, updateFonts } = useTheme();
  const { updateLogo } = useLogo();
  const [tabValue, setTabValue] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    user?.logoUrl
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
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
  const [showCustomFont, setShowCustomFont] = useState(false);
  const [customFontName, setCustomFontName] = useState("");
  const [customFontError, setCustomFontError] = useState<string | null>(null);
  const [customFontsLoaded, setCustomFontsLoaded] = useState<string[]>(() => {
    const saved = localStorage.getItem("customFontsLoaded");
    return saved ? JSON.parse(saved) : [];
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
    setLogoFile(file);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLogoUrl = reader.result as string;
        setLogoPreview(newLogoUrl);
        updateLogo(newLogoUrl);
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
    updateColors({ ...customColors, [type]: color });
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

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Adiciona as configurações como JSON
      formData.append(
        "settings",
        JSON.stringify({
          customColors: {
            primary: customColors.primary,
            secondary: customColors.secondary,
            accent: customColors.accent,
          },
          customFonts: {
            primary: customFonts.primary,
            secondary: customFonts.secondary,
          },
        })
      );

      // Se houver um novo logo, adiciona ao FormData
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await api.patch(`/nutritionists/${user?.id}/settings`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbar({
        open: true,
        message: "Configurações salvas com sucesso!",
        severity: "success",
      });

      onClose();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar configurações",
        severity: "error",
      });
    }
  };

  const handleFontChange = (type: "primary" | "secondary", value: string) => {
    updateFonts({ ...customFonts, [type]: value });
    setSnackbar({
      open: true,
      message: "Fonte atualizada com sucesso!",
      severity: "success",
    });
  };

  // Função para carregar uma fonte do Google Fonts
  const loadGoogleFont = (fontName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
        /\s+/g,
        "+"
      )}:wght@400;500;600;700&display=swap`;

      fontLink.onload = () => {
        // Adiciona a fonte à lista de fontes carregadas
        const updatedFonts = [...customFontsLoaded, fontName];
        setCustomFontsLoaded(updatedFonts);
        localStorage.setItem("customFontsLoaded", JSON.stringify(updatedFonts));
        resolve();
      };

      fontLink.onerror = () => {
        reject(new Error("Fonte não encontrada"));
      };

      document.head.appendChild(fontLink);
    });
  };

  // Carregar fontes personalizadas ao iniciar
  useEffect(() => {
    const loadSavedFonts = async () => {
      for (const font of customFontsLoaded) {
        try {
          await loadGoogleFont(font);
        } catch (error) {
          console.error(`Erro ao carregar fonte ${font}:`, error);
        }
      }
    };

    loadSavedFonts();
  }, []);

  const handleCustomFontSubmit = async (type: "primary" | "secondary") => {
    if (!customFontName.trim()) {
      setCustomFontError("Digite o nome da fonte");
      return;
    }

    try {
      const fontName = customFontName.trim();
      await loadGoogleFont(fontName);

      handleFontChange(type, fontName);
      setCustomFontName("");
      setShowCustomFont(false);
      setCustomFontError(null);
    } catch (error) {
      setCustomFontError("Fonte não encontrada no Google Fonts");
    }
  };

  // Preview das cores
  const renderColorPreview = () => (
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
        <Button variant="contained" sx={{ bgcolor: customColors.primary }}>
          Botão Principal
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: customColors.secondary,
            color: customColors.secondary,
            "&:hover": {
              borderColor: customColors.secondary,
              bgcolor: alpha(customColors.secondary, 0.1),
            },
          }}
        >
          Botão Secundário
        </Button>
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(customColors.accent, 0.1),
            color: customColors.accent,
            border: "1px solid",
            borderColor: customColors.accent,
          }}
        >
          Elemento de Destaque
        </Box>
      </Box>
    </Box>
  );

  // Carregar configurações ao abrir o modal
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const response = await api.get(`/nutritionists/${user.id}/settings`);
        const settings = response.data;

        if (settings.customColors) {
          updateColors(settings.customColors);
        }
        if (settings.customFonts) {
          updateFonts(settings.customFonts);
        }
        if (settings.logoUrl) {
          setLogoPreview(settings.logoUrl);
          updateLogo(settings.logoUrl);
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar configurações:", error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar configurações",
          severity: "error",
        });
      }
    };

    if (open) {
      loadSettings();
    }
  }, [open, user?.id]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          width: 600,
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: 2,
          boxShadow: 24,
          mx: "auto",
          my: "5vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
            flexShrink: 0,
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
        <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="configurações tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Aparência" />
            <Tab label="Design System" />
            <Tab label="Arquivos" disabled />
            <Tab label="Formulários" disabled />
            <Tab label="Outros" disabled />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box
          sx={{
            px: 3,
            overflowY: "auto",
            flexGrow: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.2)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.3)",
            },
          }}
        >
          {/* Aparência */}
          <TabPanel value={tabValue} index={0}>
            <DesignSystemCallout
              variant="info"
              title="Configurações Experimentais"
            >
              Estas configurações são experimentais e podem apresentar
              inconsistências visuais. Para uma experiência estável,
              recomendamos utilizar a aparência padrão do sistema.
            </DesignSystemCallout>

            <Box sx={{ display: "flex", justifyContent: "flex-end", my: 3 }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  // Resetar cores para o padrão
                  updateColors({
                    primary: "#2a8b8b", // Teal
                    secondary: "#75c58e", // Light Green
                    accent: "#ffd2bf", // Peach
                  });
                  // Resetar logo para o padrão
                  updateLogo("/images/logo.png");
                  setSnackbar({
                    open: true,
                    message: "Aparência redefinida para o padrão",
                    severity: "success",
                  });
                }}
                startIcon={<RestartAltIcon />}
              >
                Redefinir Aparência
              </Button>
            </Box>

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
                {Object.entries(customColors).map(([type, color]) => (
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
              {renderColorPreview()}

              {/* Color Descriptions */}
              <Box sx={{ mt: 2 }}>
                {Object.entries(customColors).map(([type, color]) => (
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

            {/* Fontes */}
            <Box sx={{ mt: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Fontes
                </Typography>
                <Tooltip title="Personalize as fontes da sua clínica">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Fonte Principal</InputLabel>
                  <Select
                    value={customFonts.primary}
                    label="Fonte Principal"
                    onChange={(e) =>
                      handleFontChange("primary", e.target.value)
                    }
                  >
                    {availableFonts.map((font) => (
                      <MenuItem
                        key={font.value}
                        value={font.value}
                        sx={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </MenuItem>
                    ))}
                    <MenuItem
                      value="custom"
                      onClick={() => setShowCustomFont(true)}
                      sx={{ color: "primary.main" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SearchIcon fontSize="small" />
                        Buscar outra fonte...
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Fonte Secundária</InputLabel>
                  <Select
                    value={customFonts.secondary}
                    label="Fonte Secundária"
                    onChange={(e) =>
                      handleFontChange("secondary", e.target.value)
                    }
                  >
                    {availableFonts.map((font) => (
                      <MenuItem
                        key={font.value}
                        value={font.value}
                        sx={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </MenuItem>
                    ))}
                    <MenuItem
                      value="custom"
                      onClick={() => setShowCustomFont(true)}
                      sx={{ color: "primary.main" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SearchIcon fontSize="small" />
                        Buscar outra fonte...
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Campo de busca personalizada */}
              <Collapse in={showCustomFont}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Buscar Fonte no Google Fonts
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Digite o nome exato da fonte como aparece no Google Fonts.
                    <Link
                      href="https://fonts.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ ml: 1 }}
                    >
                      Ver todas as fontes disponíveis
                    </Link>
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nome da fonte"
                      value={customFontName}
                      onChange={(e) => {
                        setCustomFontName(e.target.value);
                        setCustomFontError(null);
                      }}
                      error={!!customFontError}
                      helperText={customFontError}
                      placeholder="Ex: Playfair Display"
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleCustomFontSubmit("primary")}
                      disabled={!customFontName.trim()}
                    >
                      Aplicar
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Preview das fontes */}
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
                  <Typography
                    variant="h4"
                    sx={{ fontFamily: customFonts.primary }}
                  >
                    Título Principal
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: customFonts.secondary }}
                  >
                    Este é um exemplo de texto usando a fonte secundária. Aqui
                    você pode ver como o texto ficará em parágrafos e conteúdos
                    mais longos.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Design System */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Design System
              </Typography>
              <Tooltip title="Visualize e teste os componentes do design system">
                <InfoIcon fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <DesignSystemPreview />
          </TabPanel>

          {/* Arquivos (placeholder) */}
          <TabPanel value={tabValue} index={2}>
            <Typography>Em breve: Gerenciamento de arquivos</Typography>
          </TabPanel>

          {/* Formulários (placeholder) */}
          <TabPanel value={tabValue} index={3}>
            <Typography>Em breve: Gerenciamento de formulários</Typography>
          </TabPanel>

          {/* Outros (placeholder) */}
          <TabPanel value={tabValue} index={4}>
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
            flexShrink: 0,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
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

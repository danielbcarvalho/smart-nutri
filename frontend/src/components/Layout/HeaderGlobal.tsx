import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  Drawer,
  Typography,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { SearchModal } from "../SearchModal";
import { Container } from "./Container";
import { api } from "../../services/api";
import { EditProfileModal } from "../Modals/NutritionistEditProfileModal";
import NotificationsModal from "../Modals/NotificationsModal";
import AiModal from "../Modals/AiModal";
import ProfileModal from "../Modals/NutritionistProfileModal";
import { useLogo } from "../../contexts/LogoContext";
import {
  authService,
  Nutritionist,
} from "../../modules/auth/services/authService";

// Adiciona tipos para as novas props
interface HeaderGlobalProps {
  drawerContent?: React.ReactNode;
  drawerTitle?: string;
}

export const HeaderGlobal = ({
  drawerContent,
  drawerTitle,
}: HeaderGlobalProps) => {
  const navigate = useNavigate();
  const { logoUrl } = useLogo();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const user = authService.getUser();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.photoUrl || undefined
  );
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const moreMenuOpen = Boolean(moreMenuAnchorEl);

  const handleLogout = () => {
    authService.logout();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(
        `/nutritionists/${user.id}/photo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedUser = { ...user, photoUrl: response.data.photoUrl };
      localStorage.setItem("@smartnutri:user", JSON.stringify(updatedUser));

      const updatedUrl = response.data.photoUrl
        ? `${response.data.photoUrl}?t=${Date.now()}`
        : undefined;
      setAvatarUrl(updatedUrl);
    } catch (err) {
      console.log("🚀 ~ HeaderGlobal.tsx:222 ~ err 🚀🚀🚀:", err);
      // Pode adicionar notificação de erro aqui
    } finally {
      setUploading(false);
    }
  };

  // Adiciona função para atualizar user local e avatar após edição
  const handleProfileSave = (updatedUser: Nutritionist) => {
    localStorage.setItem("@smartnutri:user", JSON.stringify(updatedUser));
    const updatedUrl = updatedUser.photoUrl
      ? `${updatedUser.photoUrl}?t=${Date.now()}`
      : undefined;
    setAvatarUrl(updatedUrl);
    window.location.reload(); // Garante atualização dos dados em toda a UI
  };

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: "transparent", boxShadow: "none", p: 0 }}
    >
      <Container>
        <Toolbar sx={{ minHeight: 88 }}>
          {/* Mobile: menu contextual */}
          {isMobile && drawerContent ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  cursor: "pointer",
                }}
                onClick={() => setDrawerOpen(true)}
              >
                <IconButton>
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="subtitle1"
                  sx={{
                    ml: 1,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    color: "text.primary",
                    letterSpacing: 0.2,
                  }}
                  component="span"
                >
                  {drawerTitle || "Menu"}
                </Typography>
              </Box>
              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {drawerContent}
              </Drawer>
            </>
          ) : (
            <>
              {/* Logo/Título padrão */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              >
                <img
                  src={logoUrl}
                  alt="Smart Nutri"
                  style={{
                    height: 40,
                    width: "auto",
                    display: "block",
                    objectFit: "contain",
                    imageRendering: "crisp-edges",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                  }}
                  loading="eager"
                />
              </Box>

              {/* Ícones do lado direito */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isMobile ? (
                  <>
                    {/* Notificações */}
                    <Tooltip title="Notificações">
                      <IconButton
                        onClick={() => setNotificationsOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <NotificationsIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Perfil */}
                    <Tooltip title="Perfil">
                      <IconButton
                        onClick={() => setProfileOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <Avatar
                          key={
                            typeof avatarUrl === "string"
                              ? avatarUrl
                              : undefined
                          }
                          src={
                            typeof avatarUrl === "string"
                              ? avatarUrl
                              : undefined
                          }
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "primary.main",
                            fontSize: "1.15rem",
                            border: `3px solid ${theme.palette.custom.accent}`,
                            boxShadow: `0 2px 8px 0 ${theme.palette.custom.lightest}`,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 60%, ${theme.palette.custom.accent} 100%)`,
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: `0 4px 16px 0 ${theme.palette.custom.light}`,
                            },
                          }}
                        >
                          {!avatarUrl && <PersonIcon />}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    {/* Botão de três pontos verticais */}
                    <Tooltip title="Mais opções">
                      <IconButton
                        onClick={handleMoreMenuOpen}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={moreMenuAnchorEl}
                      open={moreMenuOpen}
                      onClose={handleMoreMenuClose}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      <MenuItem
                        onClick={() => {
                          setSearchOpen(true);
                          handleMoreMenuClose();
                        }}
                      >
                        <SearchIcon sx={{ mr: 1 }} /> Pesquisar
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setAiOpen(true);
                          handleMoreMenuClose();
                        }}
                      >
                        <img
                          src="/images/ai-animated.gif"
                          alt="IA"
                          style={{ height: 20, width: 20, marginRight: 8 }}
                        />
                        Inteligência Artificial
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          navigate("/patients");
                          handleMoreMenuClose();
                        }}
                      >
                        <GroupsIcon sx={{ mr: 1 }} /> Pacientes
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Tooltip title="Pesquisar">
                      <IconButton
                        onClick={() => setSearchOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Inteligência Artificial">
                      <IconButton
                        onClick={() => setAiOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <img
                          src="/images/ai-animated.gif"
                          alt="IA"
                          style={{ height: 24, width: 24 }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Pacientes">
                      <IconButton
                        onClick={() => navigate("/patients")}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <GroupsIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Notificações">
                      <IconButton
                        onClick={() => setNotificationsOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <NotificationsIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Perfil">
                      <IconButton
                        onClick={() => setProfileOpen(true)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        <Avatar
                          key={
                            typeof avatarUrl === "string"
                              ? avatarUrl
                              : undefined
                          }
                          src={
                            typeof avatarUrl === "string"
                              ? avatarUrl
                              : undefined
                          }
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "primary.main",
                            fontSize: "1.15rem",
                            border: `3px solid ${theme.palette.custom.accent}`,
                            boxShadow: `0 2px 8px 0 ${theme.palette.custom.lightest}`,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 60%, ${theme.palette.custom.accent} 100%)`,
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: `0 4px 16px 0 ${theme.palette.custom.light}`,
                            },
                          }}
                        >
                          {!avatarUrl && <PersonIcon />}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Modal de pesquisa */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Modal de Notificações */}
      <NotificationsModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Modal de IA */}
      <AiModal open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Modal de Perfil */}
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          avatarUrl={avatarUrl}
          uploading={uploading}
          handlePhotoChange={handlePhotoChange}
          handleLogout={handleLogout}
          setEditProfileOpen={setEditProfileOpen}
        />
      )}

      {/* Modal de edição de perfil */}
      {user && (
        <EditProfileModal
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          user={user}
          onSave={handleProfileSave}
        />
      )}
    </AppBar>
  );
};

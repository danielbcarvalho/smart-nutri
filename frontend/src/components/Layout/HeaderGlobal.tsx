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
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { SearchModal } from "../SearchModal";
import { Container } from "./Container";
import { api } from "../../services/api";
import { EditProfileModal } from "../Modals/NutritionistEditProfileModal";
import NotificationsModal from "../Modals/NotificationsModal";
import AiModal from "../Modals/AiModal";
import ProfileModal from "../Modals/NutritionistProfileModal";
import {
  authService,
  Nutritionist,
} from "../../modules/auth/services/authService";

export const HeaderGlobal = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const user = authService.getUser();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.photoUrl || null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const theme = useTheme();
  console.log("🚀 ~ HeaderGlobal.tsx:37 ~ user 🚀🚀🚀:", user);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
      console.log(
        "🚀 ~ HeaderGlobal.tsx:217 ~ updatedUser 🚀🚀🚀:",
        updatedUser
      );
      const updatedUrl = response.data.photoUrl
        ? `${response.data.photoUrl}?t=${Date.now()}`
        : null;
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
      : null;
    setAvatarUrl(updatedUrl);
    window.location.reload(); // Garante atualização dos dados em toda a UI
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: "transparent", boxShadow: "none", p: 0 }}
    >
      <Container>
        <Toolbar sx={{ minHeight: 88 }}>
          {/* Logo/Título */}
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
              src="/images/logo.png"
              alt="Smart Nutri"
              style={{ height: 40, width: "auto", display: "block" }}
            />
          </Box>

          {/* Ícones do lado direito */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  key={avatarUrl}
                  src={avatarUrl || undefined}
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
          </Box>
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
          getInitials={getInitials}
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

import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import InstagramIcon from "@mui/icons-material/Instagram";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";

type Props = {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    crn?: string;
    instagram?: string;
    clinicName?: string;
  } | null;
  avatarUrl?: string;
  uploading?: boolean;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  setEditProfileOpen: (open: boolean) => void;
};

export default function ProfileModal({
  open,
  onClose,
  user,
  avatarUrl,
  uploading,
  handlePhotoChange,
  handleLogout,
  setEditProfileOpen,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          width: 400,
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
            Meu Perfil
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Editar">
              <IconButton onClick={() => setEditProfileOpen(true)} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sair">
              <IconButton onClick={handleLogout} size="small">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box sx={{ px: 3, pt: 4, textAlign: "center" }}>
          {/* Avatar */}
          <Box
            sx={{
              position: "relative",
              mx: "auto",
              mb: 2,
              width: 100,
              height: 100,
            }}
          >
            <Avatar
              key={avatarUrl}
              src={avatarUrl || undefined}
              sx={{
                width: 100,
                height: 100,
                fontSize: "2rem",
                bgcolor: "primary.main",
              }}
            >
              {!avatarUrl && <PersonIcon />}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                bgcolor: "background.paper",
                boxShadow: 1,
                width: 32,
                height: 32,
                zIndex: 2,
              }}
            >
              <PhotoCameraIcon fontSize="small" />
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </IconButton>
            {uploading && (
              <CircularProgress
                size={100}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  bgcolor: "rgba(255,255,255,0.6)",
                  borderRadius: "50%",
                }}
              />
            )}
          </Box>

          {/* Info principal */}
          <Typography variant="h6">{user?.name}</Typography>
          <Box sx={{ mt: 2, width: "100%", px: 4 }}>
            {user?.email && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            )}

            {user?.crn && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.crn}
                </Typography>
              </Box>
            )}

            {user?.instagram && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <InstagramIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  <a
                    href={`https://instagram.com/${user.instagram.replace(
                      /^@/,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2", textDecoration: "none" }}
                  >
                    {user.instagram}
                  </a>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Info extra */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ px: 3, pb: 3 }}>
          {user?.clinicName && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Clínica
              </Typography>
              <Typography variant="body1">{user.clinicName}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

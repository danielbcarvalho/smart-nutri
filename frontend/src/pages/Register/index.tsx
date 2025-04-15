import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  useTheme,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    crn: "",
    clinicName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        crn: formData.crn || undefined,
        clinicName: formData.clinicName || undefined,
      });
      navigate("/login", {
        state: {
          message: "Cadastro realizado com sucesso! Faça login para continuar.",
        },
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message || "Ocorreu um erro ao fazer cadastro"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Background com imagem de alimentos */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50vh",
          padding: { xs: 0, sm: "15px 15px 15px 15px" },
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: "url(/images/nutri.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: { xs: 0, sm: "12px" },
            "&::before": {
              content: '""',
              position: "absolute",
              top: { xs: 0, sm: "15px" },
              left: { xs: 0, sm: "15px" },
              right: { xs: 0, sm: "15px" },
              bottom: { xs: 0, sm: "15px" },
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              zIndex: 1,
              borderRadius: { xs: 0, sm: "12px" },
            },
          }}
        />
      </Box>

      {/* Container do Formulário */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 6, sm: 8, md: 10 },
          position: "relative",
          zIndex: 2,
          backgroundColor: "transparent",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "450px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: { xs: 4, sm: 6 },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            color="#fff"
            sx={{ mb: 3, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            Cadastro de Nutricionista
          </Typography>

          <Paper
            elevation={6}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              padding: { xs: 3, sm: 4 },
              pb: { xs: 5, sm: 6 },
              backgroundColor: "background.paper",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease-in-out",
              boxShadow: theme.shadows[6],
              "&:hover": {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="Smart Nutri"
              sx={{
                width: "180px",
                height: "auto",
                mb: 4,
              }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 2,
                  borderRadius: 1,
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
              autoComplete="off"
            >
              <TextField
                required
                fullWidth
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                autoComplete="off"
                inputProps={{
                  autoComplete: "new-email",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                label="Senha"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="new-password"
                inputProps={{
                  autoComplete: "new-password",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                label="Confirmar senha"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                autoComplete="new-password"
                inputProps={{
                  autoComplete: "new-password",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Informações adicionais
                </Typography>
              </Divider>

              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="CRN"
                name="crn"
                value={formData.crn}
                onChange={(e) =>
                  setFormData({ ...formData, crn: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Nome da clínica"
                name="clinicName"
                value={formData.clinicName}
                onChange={(e) =>
                  setFormData({ ...formData, clinicName: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    height: "45px",
                    "& input": {
                      padding: "8px 14px",
                    },
                    "& .MuiInputAdornment-root": {
                      marginTop: "0 !important",
                      marginRight: 0,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(40px, 12px) scale(1)",
                    "&.Mui-focused, &.MuiFormLabel-filled": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 1,
                  boxShadow: "none",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "none",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Cadastrar"
                )}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  textTransform: "none",
                  borderRadius: "30px",
                  py: 1,
                  borderColor: "primary.light",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(76, 175, 80, 0.04)",
                    borderColor: "primary.main",
                  },
                }}
              >
                Já tem uma conta? Faça login
              </Button>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            color="black"
            sx={{
              mt: 2,
              textAlign: "center",
            }}
          >
            Smart Nutri © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

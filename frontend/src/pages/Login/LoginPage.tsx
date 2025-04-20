import React, { useState, useEffect } from "react";
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
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LocationState {
  message?: string;
  error?: string;
  from?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});

  useEffect(() => {
    // Verificar mensagens no estado da navegação
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccess(state.message);
    }
    if (state?.error) {
      setError(state.error);
    }

    // Verificar mensagens no localStorage
    const storedError = localStorage.getItem("@smartnutri:loginError");
    if (storedError) {
      setError(storedError);
      // Limpar após recuperar
      localStorage.removeItem("@smartnutri:loginError");
    }

    const storedSuccess = localStorage.getItem("@smartnutri:loginSuccess");
    if (storedSuccess) {
      setSuccess(storedSuccess);
      // Limpar após recuperar
      localStorage.removeItem("@smartnutri:loginSuccess");
    }
  }, [location]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    let isValid = true;

    if (!credentials.email) {
      errors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = "Senha é obrigatória";
      isValid = false;
    } else if (credentials.password.length < 6) {
      errors.password = "Senha deve ter no mínimo 6 caracteres";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof LoginCredentials]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Limpar mensagens de erro e sucesso quando o usuário começa a digitar
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(credentials);
      localStorage.setItem("@smartnutri:token", response.access_token);
      localStorage.setItem(
        "@smartnutri:user",
        JSON.stringify(response.nutritionist)
      );

      const state = location.state as LocationState;
      const redirectPath = state?.from || "/";

      // Armazenar mensagem de sucesso no localStorage antes do redirecionamento
      localStorage.setItem(
        "@smartnutri:loginSuccess",
        "Login realizado com sucesso!"
      );

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Ocorreu um erro ao fazer login";

      // Armazenar mensagem de erro no localStorage
      localStorage.setItem("@smartnutri:loginError", errorMessage);

      // Definir o erro para exibição imediata (sem recarregar)
      setError(errorMessage);

      // Se houver recarregamento da página, o erro será recuperado do localStorage
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
      {/* Seção Superior - Background */}
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
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" fontWeight={600} color="#fff">
              Bem-vindo, Nutricionista!
            </Typography>
            {/* <Typography variant="h6" color="#fff" sx={{ mt: 1 }}>
                Seu assistente digital para uma gestão nutricional eficiente
              </Typography> 
               */}
          </CardContent>
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              padding: { xs: 3, sm: 4 },
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

            <Typography
              variant="subtitle1"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                mb: 3,
              }}
            >
              Seu assistente digital para uma gestão nutricional eficiente
            </Typography>

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

            {success && (
              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  mb: 2,
                  borderRadius: 1,
                }}
              >
                {success}
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
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={credentials.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
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
                name="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
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
                        onClick={handleTogglePasswordVisibility}
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
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
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
                  mt: 2,
                  py: 1.5,
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
                  "Entrar"
                )}
              </Button>

              <Divider sx={{ my: 2, width: "100%" }}>
                <Typography variant="caption" color="text.secondary">
                  ou
                </Typography>
              </Divider>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "30px",
                    py: 1,
                    px: 4,
                    borderColor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(76, 175, 80, 0.04)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  Cadastre-se
                </Button>
              </Box>
            </Box>
          </Paper>
          <Typography
            variant="caption"
            color="black"
            sx={{
              m: 2,
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

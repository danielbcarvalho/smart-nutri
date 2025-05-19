import { Box, Typography, Link } from "@mui/material";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = "35991640981";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 3,
        mt: "auto",
        background: (theme) =>
          `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
          height: "1px",
          background: (theme) =>
            `linear-gradient(to right, transparent, ${theme.palette.divider}, transparent)`,
        },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{
          fontSize: "0.875rem",
          letterSpacing: "0.01em",
          opacity: 0.85,
        }}
      >
        {currentYear} © SmartNutri. Tecnologia a serviço da nutrição. |{" "}
        <Link
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{
            textDecoration: "none",
            position: "relative",
            "&:hover": {
              textDecoration: "none",
              opacity: 0.8,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "1px",
              bottom: -1,
              left: 0,
              backgroundColor: "currentColor",
              transform: "scaleX(0)",
              transition: "transform 0.2s ease-in-out",
            },
            "&:hover::after": {
              transform: "scaleX(1)",
            },
          }}
        >
          Fale com a gente
        </Link>
      </Typography>
    </Box>
  );
}

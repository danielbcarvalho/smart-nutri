import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledDropzone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s ease",

  "&:hover": {
    borderColor: theme.palette.primary.main,
  },

  "&.error": {
    borderColor: theme.palette.error.main,
  },

  "&.dragging": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const PreviewContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

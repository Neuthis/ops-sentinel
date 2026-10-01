import { createTheme } from '@mui/material/styles';

export const crystalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5F2CFF', // Chrome Violet
      light: '#8E66FF',
      dark: '#4018C4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DFF6FF', // Glass Blue
      contrastText: '#0B0F19',
    },
    background: {
      default: '#070913', // Fondo espacial profundo para resaltar el cristal
      paper: 'rgba(15, 23, 42, 0.65)',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(12, 17, 34, 0.45)', // Más translúcido para refractar el brillo
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(223, 246, 255, 0.16)',
          borderRadius: 22,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(223, 246, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '10px 22px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(95, 44, 255, 0.6)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5F2CFF 0%, #7B4DFF 100%)',
          border: '1px solid rgba(223, 246, 255, 0.3)',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: 'rgba(223, 246, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(223, 246, 255, 0.08)',
        }
      }
    }
  },
});
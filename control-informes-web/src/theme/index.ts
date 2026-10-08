import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0288d1',
      light: '#4fb3e8',
      dark: '#005b9f',
    },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2027',
      secondary: '#637381',
    },
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c62828',
      light: '#ffebee',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f57c00',
      light: '#fff3e0',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#e1f5fe',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, color: '#637381' },
    body2: { color: '#637381' },
    caption: { color: '#8899a6' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.22)',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(25, 118, 210, 0.32)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 10px rgba(145, 158, 171, 0.12)',
        },
        elevation0: { boxShadow: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 10px rgba(145, 158, 171, 0.12)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0px 8px 28px rgba(145, 158, 171, 0.22)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          '&:last-child': { paddingBottom: '20px' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.10)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'box-shadow 0.2s ease',
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.10)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 64px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          fontWeight: 700,
          padding: '20px 24px 12px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '8px 24px 16px' },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: '12px 24px 20px', gap: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#e8f0fe',
            color: '#1565c0',
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderBottom: '2px solid #c5d8fc',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.035) !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f0f3f8',
          padding: '12px 16px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(145, 158, 171, 0.10)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.06)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          // MUI v9 ya no acepta las claves filledXxx en styleOverrides
          '&.MuiAlert-filledSuccess': {
            background: 'linear-gradient(135deg, #2e7d32, #388e3c)',
          },
          '&.MuiAlert-filledError': {
            background: 'linear-gradient(135deg, #c62828, #d32f2f)',
          },
          '&.MuiAlert-filledWarning': {
            background: 'linear-gradient(135deg, #e65100, #f57c00)',
          },
          '&.MuiAlert-filledInfo': {
            background: 'linear-gradient(135deg, #01579b, #0288d1)',
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.8rem',
          backgroundColor: '#1a2027',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(145, 158, 171, 0.12)' },
      },
    },
  },
});

export default theme;

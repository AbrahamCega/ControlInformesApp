import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuthStore } from '../features/auth/hooks/useAuthStore';

const DRAWER_WIDTH = 264;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { text: 'Publicadores', icon: <PeopleIcon fontSize="small" />, path: '/publicadores' },
  { text: 'Grupos', icon: <GroupsIcon fontSize="small" />, path: '/grupos' },
  { text: 'Informes', icon: <DescriptionIcon fontSize="small" />, path: '/informes' },
  { text: 'Asistencia', icon: <EventIcon fontSize="small" />, path: '/asistencia' },
  //{ text: 'Reportes', icon: <BarChartIcon fontSize="small" />, path: '/reportes' },
  //{ text: 'Importar Excel', icon: <UploadFileIcon fontSize="small" />, path: '/excel' },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/publicadores': 'Publicadores',
  '/grupos': 'Grupos',
  '/informes': 'Informes Mensuales',
  '/asistencia': 'Registro de Asistencia'
  //'/reportes': 'Reportes',
  //'/excel': 'Importar Excel',
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, user } = useAuthStore();

  const currentTitle =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    'Sistema de Control de Informes';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
      {/* Logo area */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(145,158,171,0.10)',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(25,118,210,0.30)',
          }}
        >
          <AssignmentIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
          sx={{ fontWeight: 700, color: '#1a2027', lineHeight: 1.2, fontSize: '0.9rem', }}>
            Control Informes
          </Typography>
          <Typography variant="caption" sx={{ color: '#637381', fontSize: '0.7rem' }}>
            Sistema de gestión
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5, px: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#8899a6',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            fontSize: '0.67rem',
            px: 1.5,
            mb: 0.5,
            display: 'block',
          }}
        >
          Menú
        </Typography>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    py: 1,
                    px: 1.5,
                    position: 'relative',
                    backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'rgba(25, 118, 210, 0.12)'
                        : 'rgba(25, 118, 210, 0.05)',
                    },
                    ...(isActive && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: 3,
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: '#1976d2',
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: isActive ? '#1976d2' : '#637381',
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{ primary: { sx: {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1565c0' : '#374151',
                    } } }}
                   
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 1.5 }} />

      {/* User section */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(25,118,210,0.05)',
            border: '1px solid rgba(25,118,210,0.10)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
              fontSize: '0.85rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap
          sx={{ fontWeight: 600, color: '#1a2027', fontSize: '0.82rem', }}>
              {user?.name ?? 'Usuario'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#637381', fontSize: '0.72rem' }}>
              {user?.role ?? 'Administrador'}
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton size="small" onClick={handleLogout} sx={{ color: '#637381', '&:hover': { color: '#c62828' } }}>
              <LogoutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(145,158,171,0.12)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#637381' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a2027' }}>
            {currentTitle}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: { xs: 'flex', md: 'none' },
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 3 },
          py: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Outlet />
      </Box>
    </Box>
  );
}

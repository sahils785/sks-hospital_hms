import React from 'react';
import { 
  Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer, 
  List, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard, People, LocalHospital, EventNote, 
  Receipt, ExitToApp, LocalPharmacy, Settings, HelpOutline, NotificationsOutlined 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => { logout(); navigate('/'); };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Patients', icon: <People />, path: '/patients', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Doctors', icon: <LocalHospital />, path: '/doctors', roles: ['ROLE_ADMIN', 'ROLE_RECEPTIONIST'] },
    { text: 'Appointments', icon: <EventNote />, path: '/appointments', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Prescriptions', icon: <LocalPharmacy />, path: '/prescriptions', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PHARMACIST'] },
    { text: 'Billing', icon: <Receipt />, path: '/billing', roles: ['ROLE_ADMIN', 'ROLE_BILLING_STAFF', 'ROLE_RECEPTIONIST'] },
  ];

  const allowedMenus = menuItems.filter(item => 
    item.roles.some(role => {
      const normalizedRole = role.startsWith('ROLE_') ? role.slice(5) : role;
      return user?.roles.some(uRole => {
        const normalizedURole = uRole.startsWith('ROLE_') ? uRole.slice(5) : uRole;
        return normalizedRole === normalizedURole;
      });
    })
  );

  const isSelected = (path: string) => location.pathname.startsWith(path);

  // Mobile Drawer Menu
  const mobileDrawer = (
    <Box sx={{ width: 260, bgcolor: '#ffffff', height: '100%', color: '#0f172a', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, py: 1 }}>
        <img src="/logo.png" alt="SKS Logo" style={{ width: '36px', height: '36px' }} />
        <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#0f172a' }}>
          SKS Admin
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {allowedMenus.map((item) => (
          <ListItemButton 
            key={item.text} 
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            selected={isSelected(item.path)}
            sx={{
              borderRadius: '12px',
              color: isSelected(item.path) ? '#ffffff' : 'text.secondary',
              bgcolor: isSelected(item.path) ? '#0f172a' : 'transparent',
              '&.Mui-selected': { 
                background: '#0f172a',
                color: '#ffffff',
                '& .MuiListItemIcon-root': { color: '#ffffff' },
                '&:hover': { background: '#1e293b' }
              },
              '&:hover': {
                background: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600, fontSize: '15px' }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
        <Divider sx={{ mb: 2 }} />
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{ borderRadius: '12px', textTransform: 'none', py: 1 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: '#ffffff', 
          color: '#0f172a', 
          boxShadow: '0 4px 20px -10px rgba(15, 23, 42, 0.05)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 74, px: { xs: 2, md: 4 } }}>
          {/* Left brand logo */}
          <Box 
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          >
            <img src="/logo.png" alt="SKS Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#0f172a' }}>
              SKS Admin
            </Typography>
          </Box>

          {/* Desktop Navigation Links (Pill shaped as in mockup) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center' }}>
            {allowedMenus.map((item) => {
              const active = isSelected(item.path);
              return (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '24px',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    fontSize: '14px',
                    bgcolor: active ? '#0f172a' : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: active ? '#1e293b' : 'rgba(15, 23, 42, 0.04)',
                      color: active ? '#ffffff' : '#0f172a',
                    }
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
          </Box>

          {/* Right Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notification and support icons */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}><NotificationsOutlined fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}><HelpOutline fontSize="small" /></IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0', width: 36, height: 36, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                {user?.username?.[0].toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Administrator
                </Typography>
              </Box>
            </Box>

            <IconButton 
              color="inherit" 
              onClick={handleLogout} 
              sx={{ display: { xs: 'none', md: 'flex' }, border: '1px solid #e2e8f0', p: 1 }}
            >
              <ExitToApp fontSize="small" />
            </IconButton>

            {/* Mobile Hamburger toggle */}
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', borderRight: 'none' }
        }}
      >
        {mobileDrawer}
      </Drawer>

      <Box sx={{ display: 'flex', flexGrow: 1, mt: 9.25 }}>
        {/* Left Side Icon Bar (Matching left icon bar in mockup dashboard) */}
        <Box 
          sx={{ 
            width: 76, 
            bgcolor: '#ffffff', 
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            gap: 3.5,
            zIndex: 100
          }}
        >
          {allowedMenus.map((item) => (
            <Tooltip key={item.text} title={item.text} placement="right">
              <IconButton 
                onClick={() => navigate(item.path)}
                sx={{ 
                  color: isSelected(item.path) ? '#0f172a' : '#94a3b8',
                  bgcolor: isSelected(item.path) ? 'rgba(15, 23, 42, 0.04)' : 'transparent',
                  p: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(15, 23, 42, 0.04)',
                    color: '#0f172a'
                  }
                }}
              >
                {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
              </IconButton>
            </Tooltip>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ color: '#94a3b8' }}><Settings /></IconButton>
        </Box>

        {/* Main Content Area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 3, md: 4 }, 
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;

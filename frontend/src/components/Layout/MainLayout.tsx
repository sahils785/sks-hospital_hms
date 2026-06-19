import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItemIcon, ListItemText, Divider, IconButton, Button, ListItemButton } from '@mui/material';
import { Menu as MenuIcon, Dashboard, People, LocalHospital, EventNote, Receipt, ExitToApp, LocalPharmacy } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const drawerWidth = 240;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Patients', icon: <People />, path: '/patients', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Doctors', icon: <LocalHospital />, path: '/doctors', roles: ['ROLE_ADMIN', 'ROLE_RECEPTIONIST'] },
    { text: 'Appointments', icon: <EventNote />, path: '/appointments', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'] },
    { text: 'Prescriptions', icon: <LocalPharmacy />, path: '/prescriptions', roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PHARMACIST'] },
    { text: 'Billing', icon: <Receipt />, path: '/billing', roles: ['ROLE_ADMIN', 'ROLE_BILLING_STAFF', 'ROLE_RECEPTIONIST'] },
  ];

  const allowedMenus = menuItems.filter(item => 
    item.roles.some(role => user?.roles.includes(role))
  );

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', gap: 1, px: 2 }}>
        <img src="/logo.png" alt="SKS Hospital Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <Typography variant="h6" color="primary" fontWeight="bold">SKS ADMIN</Typography>
      </Toolbar>
      <Divider />
      <List>
        {allowedMenus.map((item) => (
          <ListItemButton 
            key={item.text} 
            onClick={() => navigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{
              '&.Mui-selected': { 
                background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0) 100%)', 
                color: 'primary.main', 
                borderLeft: '4px solid #4f46e5',
                '& .MuiListItemIcon-root': { color: 'primary.main' } 
              },
              borderRadius: '0 24px 24px 0', mr: 2, mb: 1,
              borderLeft: '4px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(79, 70, 229, 0.05)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` }, 
          bgcolor: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(12px)',
          color: 'text.primary', 
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {allowedMenus.find(m => location.pathname.startsWith(m.path))?.text || 'Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{user?.username}</Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout} startIcon={<ExitToApp />} sx={{ borderRadius: 8, textTransform: 'none', px: 2 }}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '4px 0 10px rgba(0,0,0,0.02)' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;

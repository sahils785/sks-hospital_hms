import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/Patients/PatientsList';
import DoctorsList from './pages/Doctors/DoctorsList';
import AppointmentsList from './pages/Appointments/AppointmentsList';
import PrescriptionsList from './pages/Prescriptions/PrescriptionsList';
import BillingList from './pages/Billing/BillingList';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818cf8', light: '#a5b4fc', dark: '#4f46e5' },
    secondary: { main: '#2dd4bf', light: '#5eead4', dark: '#0d9488' },
    background: { default: '#0B1120', paper: 'rgba(30, 41, 59, 0.7)' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: { 
    fontFamily: '"Outfit", "Inter", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          borderRadius: '12px',
          padding: '8px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 20px -6px rgba(79, 70, 229, 0.4)',
          }
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 8px 20px -6px rgba(13, 148, 136, 0.4)',
          }
        }
      } 
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
        } 
      } 
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          backgroundColor: '#1e293b'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: '#94a3b8',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        }
      }
    }
  },
});

const Unauthorized = () => <div style={{padding:'2rem'}}><h2>Unauthorized</h2><p>You don't have access to this page.</p></div>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="made-by-sahil">Made by Sahil</div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="/" element={<ProtectedRoute><MainLayout><Navigate to="/dashboard" replace /></MainLayout></ProtectedRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        
        <Route path="/patients/*" element={<ProtectedRoute><MainLayout><PatientsList /></MainLayout></ProtectedRoute>} />
        <Route path="/doctors/*" element={<ProtectedRoute><MainLayout><DoctorsList /></MainLayout></ProtectedRoute>} />
        <Route path="/appointments/*" element={<ProtectedRoute><MainLayout><AppointmentsList /></MainLayout></ProtectedRoute>} />
        
        <Route path="/prescriptions/*" element={<ProtectedRoute><MainLayout><PrescriptionsList /></MainLayout></ProtectedRoute>} />
        <Route path="/billing/*" element={<ProtectedRoute><MainLayout><BillingList /></MainLayout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

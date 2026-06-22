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
import Landing from './pages/Landing';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f172a', light: '#334155', dark: '#020617' },
    secondary: { main: '#0d9488', light: '#14b8a6', dark: '#115e59' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  typography: { 
    fontFamily: '"Outfit", "Inter", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0f172a' },
    h6: { fontWeight: 600, color: '#0f172a' },
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          borderRadius: '24px',
          padding: '8px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.15)',
          }
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 8px 20px -6px rgba(13, 148, 136, 0.2)',
          }
        }
      } 
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          backgroundImage: 'none',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04)'
        } 
      } 
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          backgroundColor: '#ffffff'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: 'rgba(15, 23, 42, 0.03)',
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
        
        <Route path="/" element={<Landing />} />
        
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

import React from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Grid } from '@mui/material';
import { useForm as useRHForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useRHForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        usernameOrEmail: data.username,
        password: data.password
      });
      const authData = response.data.data;
      setAuth(
        { id: authData.id || authData.userId, username: authData.username, email: authData.email, roles: authData.roles },
        authData.accessToken,
        authData.refreshToken
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const MotionPaper = motion(Paper);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: '#f1f5f9',
      backgroundImage: 'radial-gradient(at 0% 0%, #e0f2f1 0%, transparent 60%), radial-gradient(at 100% 100%, #e0f7fa 0%, transparent 60%)',
      p: 2
    }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        elevation={0}
        sx={{ 
          width: '100%', 
          maxWidth: 960,
          borderRadius: '32px',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Grid container>
          {/* Left panel - Vector Illustration (Only visible on md/desktop) */}
          <Grid item xs={12} md={6} sx={{ 
            bgcolor: '#f0fdfa',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 5,
            borderRight: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <img 
                src="/doctors_illustration.png" 
                alt="Healthcare illustration" 
                style={{ 
                  width: '90%', 
                  maxHeight: '380px', 
                  objectFit: 'contain',
                  borderRadius: '16px' 
                }} 
              />
            </Box>
          </Grid>

          {/* Right panel - Login form */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            p: { xs: 4, sm: 6 } 
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {/* Header Logo */}
              <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                <img src="/logo.png" alt="SKS Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#0f766e' }}>
                  SKS Admin
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.03em', color: '#1e293b', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Please enter your credentials to continue
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '12px', 
                  bgcolor: '#fef2f2', 
                  color: '#ef4444', 
                  border: '1px solid #fee2e2' 
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth 
                label="Username" 
                margin="normal"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                InputLabelProps={{ style: { color: '#64748b' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                  },
                  '& input': { color: '#0f172a' }
                }}
              />
              <TextField
                fullWidth 
                label="Password" 
                type="password" 
                margin="normal"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ style: { color: '#64748b' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                  },
                  '& input': { color: '#0f172a' }
                }}
              />
              <Button
                fullWidth 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={isSubmitting} 
                sx={{ 
                  mt: 4, 
                  py: 1.5,
                  borderRadius: '12px', 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 4px 15px -3px rgba(13, 148, 136, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  }
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="text" 
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#64748b', 
                  textTransform: 'none', 
                  fontWeight: 600,
                  fontSize: '14px',
                  '&:hover': { color: '#0d9488', bgcolor: 'transparent' } 
                }}
              >
                ← Back to Home
              </Button>
            </Box>
          </Grid>
        </Grid>
      </MotionPaper>
    </Box>
  );
};

export default Login;

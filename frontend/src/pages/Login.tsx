import React from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
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
      background: '#090d16',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0, transparent 60%), radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.15) 0, transparent 60%)'
    }}>
      <MotionPaper
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        elevation={0}
        sx={{ 
          p: 5, 
          width: '100%', 
          maxWidth: 420,
          background: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="primary.light" fontWeight="800" sx={{ letterSpacing: '-0.03em', mb: 1 }}>
          SKS HMS
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
          SaaS Medical Administrative Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.02)',
              }
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.02)',
              }
            }}
          />
          <Button
            fullWidth 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large" 
            disabled={isSubmitting} 
            sx={{ 
              mt: 4, 
              py: 1.5,
              borderRadius: '12px', 
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              }
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </MotionPaper>
    </Box>
  );
};

export default Login;

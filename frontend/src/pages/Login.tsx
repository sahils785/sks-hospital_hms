import React from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useForm as useRHForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

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
      const response = await api.post('/auth/login', data);
      const authData = response.data.data;
      setAuth(
        { id: authData.id, username: authData.username, email: authData.email, roles: authData.roles },
        authData.accessToken,
        authData.refreshToken
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary" fontWeight="bold">
          HMS
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth label="Username" margin="normal"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            fullWidth label="Password" type="password" margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            fullWidth type="submit" variant="contained" color="primary"
            size="large" disabled={isSubmitting} sx={{ mt: 3 }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

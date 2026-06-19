import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Skeleton, Alert } from '@mui/material';
import { People, LocalHospital, EventNote, MonetizationOn, AccessTime } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, gradient, loading }: any) => {
  const CardWrapper = motion(Card);

  return (
    <CardWrapper
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ 
        height: '100%', 
        background: gradient || 'rgba(30, 41, 59, 0.4)',
        color: gradient ? '#fff' : 'inherit',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: gradient ? `0 20px 40px -10px ${color}50` : '0 20px 40px -10px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box className="flex-1">
            <Typography sx={{ color: gradient ? 'rgba(255,255,255,0.8)' : 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', mb: 1 }} variant="overline">
              {title}
            </Typography>
            {loading ? (
              <Skeleton width="60%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            ) : (
              <Typography variant="h3" fontWeight="bold">
                {value}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: gradient ? 'rgba(255,255,255,0.15)' : `${color}15`, 
            p: 1.5, 
            borderRadius: 3, 
            display: 'flex',
            backdropFilter: 'blur(10px)'
          }}>
            {React.cloneElement(icon, { sx: { color: gradient ? '#fff' : color, fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </CardWrapper>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  const chartData = stats?.charts?.revenueHistory || [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];

  const metrics = stats?.metrics || {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  };

  const recentAppts = stats?.recentAppointments || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.light" sx={{ mb: 0.5 }}>
            Welcome back, {user?.username} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is what's happening at your hospital today.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
          Failed to fetch real-time analytics data. Displaying offline metrics.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Patients" 
            value={metrics.totalPatients.toLocaleString()} 
            icon={<People />} 
            color="#6366f1" 
            gradient="linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Doctors" 
            value={metrics.totalDoctors} 
            icon={<LocalHospital />} 
            color="#14b8a6" 
            gradient="linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Today's Appointments" 
            value={metrics.totalAppointments} 
            icon={<EventNote />} 
            color="#f59e0b"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="SaaS Paid Revenue" 
            value={`$${metrics.totalRevenue.toLocaleString()}`} 
            icon={<MonetizationOn />} 
            color="#ec4899"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 420, borderRadius: '24px', bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">Monthly Revenue Overview</Typography>
            </Box>
            {isLoading ? (
              <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' }} />
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 420, borderRadius: '24px', bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Recent Booked Appointments</Typography>
            {isLoading ? (
              <Box display="flex" flexDirection="column" gap={2}>
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} variant="rectangular" height={60} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' }} />
                ))}
              </Box>
            ) : recentAppts.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="70%">
                <EventNote sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">No appointments booked today</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentAppts.map((apt: any, i: number) => (
                  <Box key={i} sx={{ 
                    display: 'flex', alignItems: 'center', p: 1.5, 
                    bgcolor: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.5)' }
                  }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <AccessTime sx={{ color: '#818cf8' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{apt.patientName}</Typography>
                      <Typography variant="body2" color="textSecondary">{apt.doctorName} • {apt.status}</Typography>
                    </Box>
                    <Typography variant="subtitle2" color="primary.light" fontWeight="bold">
                      {new Date(apt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

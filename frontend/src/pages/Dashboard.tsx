import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { People, LocalHospital, EventNote, MonetizationOn } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', patients: 40, appointments: 24 },
  { name: 'Tue', patients: 30, appointments: 13 },
  { name: 'Wed', patients: 20, appointments: 98 },
  { name: 'Thu', patients: 27, appointments: 39 },
  { name: 'Fri', patients: 18, appointments: 48 },
  { name: 'Sat', patients: 23, appointments: 38 },
  { name: 'Sun', patients: 34, appointments: 43 },
];

const StatCard = ({ title, value, icon, color, gradient }: any) => (
  <Card sx={{ 
    height: '100%', 
    background: gradient || 'rgba(30, 41, 59, 0.5)',
    color: gradient ? '#fff' : 'inherit',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: `0 20px 40px -10px ${color}40`,
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography sx={{ color: gradient ? 'rgba(255,255,255,0.8)' : 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', mb: 1 }} variant="overline">
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`, 
          p: 1.5, 
          borderRadius: 3, 
          display: 'flex',
          backdropFilter: 'blur(10px)'
        }}>
          {React.cloneElement(icon, { sx: { color: gradient ? '#fff' : color, fontSize: 32 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.dark" sx={{ mb: 0.5 }}>
            Welcome back, {user?.username} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is what's happening at your hospital today.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Patients" value="1,248" icon={<People />} color="#4f46e5" gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Available Doctors" value="45" icon={<LocalHospital />} color="#0d9488" gradient="linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Today's Appointments" value="86" icon={<EventNote />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Today's Revenue" value="₹4,520" icon={<MonetizationOn />} color="#ec4899" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 420, borderRadius: '24px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">Weekly Activity Overview</Typography>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="appointments" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={24} />
                <Bar dataKey="patients" fill="#14b8a6" radius={[6, 6, 6, 6]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 420, borderRadius: '24px', overflow: 'hidden' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Upcoming Appointments</Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { name: 'Aarav Mehta', dr: 'Dr. Singh', dept: 'Cardiology', time: '10:00 AM', color: '#4f46e5' },
                { name: 'Sneha Kapoor', dr: 'Dr. Desai', dept: 'Neurology', time: '11:30 AM', color: '#0d9488' },
                { name: 'Karan Joshi', dr: 'Dr. Malhotra', dept: 'Orthopedics', time: '01:15 PM', color: '#f59e0b' },
                { name: 'Riya Verma', dr: 'Dr. Iyer', dept: 'Pediatrics', time: '03:00 PM', color: '#ec4899' },
              ].map((apt, i) => (
                <Box key={i} sx={{ 
                  display: 'flex', alignItems: 'center', p: 1.5, 
                  bgcolor: 'rgba(15, 23, 42, 0.5)', 
                  borderRadius: '16px',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' }
                }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${apt.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <EventNote sx={{ color: apt.color }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{apt.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{apt.dr} • {apt.dept}</Typography>
                  </Box>
                  <Typography variant="subtitle2" color="primary.main" fontWeight="bold">{apt.time}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

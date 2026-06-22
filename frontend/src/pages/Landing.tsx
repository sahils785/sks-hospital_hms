import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Grid, Paper, Avatar, 
  Accordion, AccordionSummary, AccordionDetails, 
  Divider, Tooltip 
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowForward, PlayArrow, Dashboard, People, LocalHospital, 
  EventNote, Receipt, ArrowUpward, AccessTime, LocalPharmacy, 
  TrendingUp, Security, SupportAgent, ExpandMore, Healing, 
  Star 
} from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Rotating log lines for PostgreSQL status terminal
  const [logLines, setLogLines] = useState<string[]>([
    '[11:04:02 PM] [SYS] Database connection pools healthy',
    '[11:04:05 PM] [INFO] Supabase session verified: ROLE_ADMIN',
    '[11:04:07 PM] [QUERY] SELECT * FROM analytics_summary WHERE timestamp > NOW()',
    '[11:04:12 PM] [SYS] Express monolithic server running on port 8080'
  ]);

  useEffect(() => {
    const logs = [
      'SELECT count(*) FROM patients',
      'Memory usage: 228MB / 1024MB',
      'GET /api/v1/analytics/dashboard - 200 OK (14ms)',
      'UPDATE room_occupancy SET status="OCCUPIED" WHERE bed_id=45',
      'Database Cache hit rate: 98.4%',
      'Mail delivery queue cleared successfully',
      'SELECT * FROM doctors WHERE active=true',
      'POST /api/v1/appointments/new - 201 Created (22ms)'
    ];
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogLines(prev => [...prev.slice(-4), `[${timestamp}] [SYS] ${randomLog}`]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc', 
      color: '#0f172a',
      fontFamily: '"Outfit", "Inter", sans-serif',
      backgroundImage: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 40%, #cbd5e1 100%)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Landing Header */}
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/logo.png" alt="SKS Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.03em', color: '#0f172a' }}>
              SKS Admin
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
            {[
              { label: 'Product', id: 'product' },
              { label: 'Service', id: 'service' },
              { label: 'Activity', id: 'activity' },
              { label: 'Support', id: 'support' }
            ].map((link) => (
              <Typography 
                key={link.id} 
                variant="body2" 
                fontWeight="700" 
                onClick={() => scrollToSection(link.id)}
                sx={{ 
                  color: '#64748b', 
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#0f172a' } 
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>

          {/* Action CTA */}
          <Button 
            variant="contained" 
            onClick={handleAction}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '24px', 
              fontWeight: 700, 
              px: 3.5,
              py: 1.2,
              background: '#0f172a',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              '&:hover': {
                background: '#334155',
              }
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </Button>
        </Box>
      </Container>

      {/* Hero Content Section */}
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: 6, textAlign: 'center' }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Title Heading */}
          <MotionTypography 
            variant="h2" 
            fontWeight="800" 
            sx={{ 
              letterSpacing: '-0.04em', 
              lineHeight: 1.15,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.8rem', md: '4.4rem' },
              color: '#0f172a'
            }}
          >
            Transform <Box component="span" sx={{ color: '#0d9488', background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Healthcare</Box> Efficiency <br /> with Cutting-Edge Technology
          </MotionTypography>
          
          {/* Subtitle description */}
          <Typography variant="body1" sx={{ color: '#475569', fontSize: '18px', mb: 5, lineHeight: 1.6, maxWidth: '640px', mx: 'auto' }}>
            Manage patients, staff, appointments, pharmacy, and billing records in a unified, lightning-fast light system.
          </Typography>
          
          {/* Dual Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, flexWrap: 'wrap', mb: 10 }}>
            <Button 
              variant="contained" 
              onClick={handleAction}
              sx={{ 
                borderRadius: '30px', 
                fontWeight: 700, 
                px: 4, 
                py: 1.8,
                bgcolor: '#0f172a',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  bgcolor: '#334155',
                }
              }}
            >
              Get Started
              <Box sx={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ArrowForward sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
            </Button>

            <Button 
              variant="outlined" 
              onClick={() => scrollToSection('product')}
              sx={{ 
                borderRadius: '30px', 
                fontWeight: 700, 
                px: 4, 
                py: 1.8,
                borderColor: 'rgba(15, 23, 42, 0.1)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  bgcolor: 'rgba(15, 23, 42, 0.02)'
                }
              }}
            >
              Explore Modules
              <Box sx={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%', 
                bgcolor: '#0f172a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <PlayArrow sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
            </Button>
          </Box>
        </MotionBox>
      </Container>

      {/* Overlapping Dashboard Preview */}
      <Container maxWidth="lg" sx={{ mt: -2, position: 'relative', zIndex: 10, pb: 12 }}>
        <MotionBox
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            bgcolor: '#ffffff',
            boxShadow: '0 50px 100px -20px rgba(15, 23, 42, 0.12), 0 30px 60px -30px rgba(0, 0, 0, 0.15)',
            p: 1.5,
            overflow: 'hidden'
          }}
        >
          {/* Browser Window Header */}
          <Box sx={{ 
            bgcolor: '#f1f5f9', 
            borderRadius: '18px 18px 0 0', 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Box display="flex" gap={1}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
            </Box>
            <Box sx={{ 
              bgcolor: '#ffffff', 
              borderRadius: '8px', 
              px: 4, 
              py: 0.5, 
              fontSize: '12px', 
              color: '#94a3b8',
              border: '1px solid #e2e8f0',
              fontWeight: 500
            }}>
              https://sks-hospital.vercel.app/dashboard
            </Box>
            <Box sx={{ width: 40 }} />
          </Box>

          {/* Browser Content - Mocked Dashboard */}
          <Box sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 4 }, display: 'flex', gap: 3, minHeight: '620px' }}>
            {/* Sidebar Mock Column */}
            <Box sx={{ 
              width: 68, 
              bgcolor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              display: { xs: 'none', md: 'flex' }, 
              flexDirection: 'column', 
              gap: 3, 
              alignItems: 'center',
              py: 4
            }}>
              <Avatar sx={{ bgcolor: '#0f172a', width: 40, height: 40, color: '#ffffff', fontWeight: 800, fontSize: '15px', mb: 2 }}>H</Avatar>
              
              <Tooltip title="Dashboard" placement="right">
                <Box sx={{ color: '#ffffff', bgcolor: '#0f172a', p: 1.5, borderRadius: '12px', display: 'flex', cursor: 'pointer' }}>
                  <Dashboard sx={{ fontSize: 20 }} />
                </Box>
              </Tooltip>

              <Tooltip title="Patients" placement="right">
                <Box sx={{ color: '#94a3b8', p: 1.5, borderRadius: '12px', display: 'flex', cursor: 'pointer', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}>
                  <People sx={{ fontSize: 20 }} />
                </Box>
              </Tooltip>

              <Tooltip title="Doctors" placement="right">
                <Box sx={{ color: '#94a3b8', p: 1.5, borderRadius: '12px', display: 'flex', cursor: 'pointer', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}>
                  <LocalHospital sx={{ fontSize: 20 }} />
                </Box>
              </Tooltip>

              <Tooltip title="Appointments" placement="right">
                <Box sx={{ color: '#94a3b8', p: 1.5, borderRadius: '12px', display: 'flex', cursor: 'pointer', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}>
                  <EventNote sx={{ fontSize: 20 }} />
                </Box>
              </Tooltip>

              <Tooltip title="Billing" placement="right">
                <Box sx={{ color: '#94a3b8', p: 1.5, borderRadius: '12px', display: 'flex', cursor: 'pointer', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}>
                  <Receipt sx={{ fontSize: 20 }} />
                </Box>
              </Tooltip>
            </Box>

            {/* Main Dashboard Area */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Top Navigation Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" gap={1}>
                  <Box sx={{ bgcolor: '#0f172a', color: '#fff', px: 3, py: 1, borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Dashboard</Box>
                  {['Patient', 'Doctors', 'Appointment', 'Prescriptions', 'Billing'].map(tab => (
                    <Box key={tab} sx={{ color: '#64748b', px: 2.5, py: 1, borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#0f172a' } }}>{tab}</Box>
                  ))}
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', width: 34, height: 34, fontSize: '13px', color: '#0f172a', fontWeight: 700, border: '1px solid #e2e8f0' }}>A</Avatar>
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>Admin</Typography>
                </Box>
              </Box>

              {/* Grid content */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: '#0f172a' }}>Statistical Summary</Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Patients</Typography>
                        <Box display="flex" alignItems="baseline" gap={1} mt={1}>
                          <Typography variant="h4" fontWeight="800" color="#0f172a">3,240</Typography>
                          <Box sx={{ bgcolor: '#e6fcf5', color: '#0ca678', px: 1, py: 0.25, borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            <ArrowUpward sx={{ fontSize: 10, mr: 0.25 }} /> +12.5%
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2, height: 32 }}>
                          <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                            <path d="M0,25 Q15,10 30,20 T60,5 T90,15 T100,10" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Visits</Typography>
                        <Box display="flex" alignItems="baseline" gap={1} mt={1}>
                          <Typography variant="h4" fontWeight="800" color="#0f172a">78</Typography>
                          <Box sx={{ bgcolor: '#e6fcf5', color: '#0ca678', px: 1, py: 0.25, borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            <ArrowUpward sx={{ fontSize: 10, mr: 0.25 }} /> +8.2%
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2, height: 32 }}>
                          <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                            <path d="M0,20 Q20,30 40,10 T80,18 T100,5" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room Capacity</Typography>
                        <Box display="flex" alignItems="baseline" gap={1} mt={1}>
                          <Typography variant="h4" fontWeight="800" color="#0f172a">12/188</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, ml: 1 }}>Active Beds</Typography>
                        </Box>
                        <Box sx={{ mt: 3.5, width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ width: '67%', height: '100%', bgcolor: '#f59e0b', borderRadius: 3 }} />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Occupancy Weekly Trends Bar Graph */}
                  <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, color: '#0f172a' }}>Weekly Activity Trends</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, pt: 1, px: 2 }}>
                      {[
                        { day: 'Mon', h: 60 }, { day: 'Tue', h: 80 }, { day: 'Wed', h: 45 },
                        { day: 'Thu', h: 95 }, { day: 'Fri', h: 70 }, { day: 'Sat', h: 30 },
                        { day: 'Sun', h: 20 }
                      ].map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '10%' }}>
                          <Box sx={{ 
                            width: '100%', 
                            height: `${item.h}px`, 
                            background: idx === 3 ? 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)' : 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)', 
                            borderRadius: '6px 6px 0 0' 
                          }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.day}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Doctor's Schedule</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { doctor: 'Dr. John Smith', status: 'In Clinic', patient: 'Rahul Sharma', time: '09:00 am', color: '#0ea5e9' },
                        { doctor: 'Dr. Rakesh Singh', status: 'On Call', patient: 'Jane Doe', time: '11:30 am', color: '#10b981' },
                        { doctor: 'Dr. Priya Patel', status: 'Surgery', patient: 'Amit Verma', time: '02:30 pm', color: '#f59e0b' }
                      ].map((row, idx) => (
                        <Box key={idx} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">{row.doctor}</Typography>
                            <Box sx={{ bgcolor: `${row.color}15`, color: row.color, px: 1.25, py: 0.25, borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>{row.status}</Box>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>{row.patient}</Typography>
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
                              <AccessTime sx={{ fontSize: 13 }} />
                              <Typography variant="caption" fontWeight={600}>{row.time}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </MotionBox>
      </Container>

      {/* ==============================================
          PRODUCT SECTION (#product)
          ============================================== */}
      <Box id="product" sx={{ py: 12, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="secondary.main" fontWeight="800" sx={{ letterSpacing: '0.15em' }}>
              PRODUCT CAPABILITIES
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 1, mb: 2, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Our Comprehensive Modules
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxW: '600px', mx: 'auto', fontSize: '17px' }}>
              SKS Admin streamlines workflows across your entire clinic, connecting patients, doctors, and back-office staff.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: 'Patient EMR Management',
                description: 'Secure electronic medical records capturing health cards, clinical history, check-in timelines, and prescriptions.',
                icon: <People sx={{ fontSize: 28, color: '#3b82f6' }} />,
                bg: 'rgba(59, 130, 246, 0.05)',
                border: 'rgba(59, 130, 246, 0.15)'
              },
              {
                title: 'Doctor & Roster Scheduling',
                description: 'Coordinate doctor consultation schedules, configure availability rules, and allocate shifts efficiently.',
                icon: <LocalHospital sx={{ fontSize: 28, color: '#0d9488' }} />,
                bg: 'rgba(13, 148, 136, 0.05)',
                border: 'rgba(13, 148, 136, 0.15)'
              },
              {
                title: 'Smart Appointment Booking',
                description: 'Instantly schedule visits, auto-detect conflicting schedules, and issue real-time status updates.',
                icon: <EventNote sx={{ fontSize: 28, color: '#f59e0b' }} />,
                bg: 'rgba(245, 158, 11, 0.05)',
                border: 'rgba(245, 158, 11, 0.15)'
              },
              {
                title: 'Prescription & Pharmacy Log',
                description: 'Generate formatted digital prescriptions directly synced with inventory to dispense medications without delay.',
                icon: <LocalPharmacy sx={{ fontSize: 28, color: '#10b981' }} />,
                bg: 'rgba(16, 185, 129, 0.05)',
                border: 'rgba(16, 185, 129, 0.15)'
              },
              {
                title: 'Billing & Invoicing Suite',
                description: 'Compile consultation fees, room rent, and prescription costs into professional, downloadable invoices.',
                icon: <Receipt sx={{ fontSize: 28, color: '#ec4899' }} />,
                bg: 'rgba(236, 72, 153, 0.05)',
                border: 'rgba(236, 72, 153, 0.15)'
              },
              {
                title: 'Analytics & Trends Monitoring',
                description: 'Access real-time database figures, patient trends, daily clinic check-ins, and hospital revenue metrics.',
                icon: <TrendingUp sx={{ fontSize: 28, color: '#8b5cf6' }} />,
                bg: 'rgba(139, 92, 246, 0.05)',
                border: 'rgba(139, 92, 246, 0.15)'
              }
            ].map((module, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <MotionBox
                  whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: module.border,
                    bgcolor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Box sx={{ 
                    alignSelf: 'flex-start', 
                    p: 1.5, 
                    borderRadius: '16px', 
                    bgcolor: module.bg,
                    display: 'flex'
                  }}>
                    {module.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a' }}>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    {module.description}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==============================================
          SERVICE SECTION (#service)
          ============================================== */}
      <Box id="service" sx={{ py: 12, bgcolor: '#f1f5f9' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="secondary.main" fontWeight="800" sx={{ letterSpacing: '0.15em' }}>
              CLINICAL SERVICES
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 1, mb: 2, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Seamless Care Integration
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxW: '600px', mx: 'auto', fontSize: '17px' }}>
              Empowering clinical operators with backend service synchronization to deliver state-of-the-art care.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            {/* Left side: Feature items */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {[
                {
                  title: 'Emergency Care Coordination',
                  desc: 'Priority queueing mechanics that alert active on-call staff instantly when critical emergency records are updated.',
                  icon: <Healing sx={{ color: '#ef4444' }} />
                },
                {
                  title: 'Virtual Consultations Portal',
                  desc: 'In-app hooks prepared to support telehealth video links directly inside patient check-in timeline records.',
                  icon: <SupportAgent sx={{ color: '#3b82f6' }} />
                },
                {
                  title: 'Role-Based Access Control',
                  desc: 'Comprehensive permission scopes ensuring that patient medical history is exclusively visible to doctors and authorized staff.',
                  icon: <Security sx={{ color: '#10b981' }} />
                }
              ].map((service, idx) => (
                <Paper key={idx} sx={{ p: 3, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#ffffff' }}>
                  <Box display="flex" gap={2}>
                    <Box sx={{ p: 1, height: 'fit-content', borderRadius: '10px', bgcolor: 'rgba(15, 23, 42, 0.03)', display: 'flex' }}>
                      {service.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                        {service.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Grid>

            {/* Right side: visual highlight card */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 4.5, 
                borderRadius: '24px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.25)'
              }}>
                {/* Background glow decoration */}
                <Box sx={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(0,0,0,0) 70%)',
                  pointerEvents: 'none'
                }} />

                <Typography variant="h5" fontWeight="800" sx={{ mb: 2, letterSpacing: '-0.02em' }}>
                  Enterprise Hospital Ready
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4 }}>
                  Built with scalability at its core, SKS Admin seamlessly handles heavy patient databases while guaranteeing lightning-fast response times. It has been built with an interface that doctors and hospital staff love to interact with.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    '99.98% Monolithic Service Uptime SLA',
                    'Zero Configuration Supabase Direct Mode',
                    'Secure TLS 1.3 In-Flight Encryption'
                  ].map((benefit, i) => (
                    <Box key={i} display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(13, 148, 136, 0.2)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#2dd4bf'
                      }}>
                        ✓
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {benefit}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.08)' }} />

                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex">
                    {[1, 2, 3].map(n => (
                      <Avatar key={n} sx={{ 
                        width: 32, 
                        height: 32, 
                        border: '2px solid #0f172a', 
                        marginLeft: n > 1 ? -1.25 : 0,
                        bgcolor: n === 1 ? '#0d9488' : n === 2 ? '#3b82f6' : '#eab308',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {n === 1 ? 'DR' : n === 2 ? 'RN' : 'ADM'}
                      </Avatar>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Trusted by 45+ healthcare directors globally.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==============================================
          ACTIVITY / STATS SECTION (#activity)
          ============================================== */}
      <Box id="activity" sx={{ py: 12, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="secondary.main" fontWeight="800" sx={{ letterSpacing: '0.15em' }}>
              LIVE SYSTEM VITALITY
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 1, mb: 2, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Real-Time Platform Statistics
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxW: '600px', mx: 'auto', fontSize: '17px' }}>
              Track the current system efficiency rates, active database pools, and query performance metrics.
            </Typography>
          </Box>

          {/* Quick Counter Grid */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {[
              { label: 'Registered Patients', val: '3.2k+', desc: 'Active records in database' },
              { label: 'On-Boarded Clinicians', val: '120+', desc: 'Across specialized wards' },
              { label: 'Uptime Reliability SLA', val: '99.99%', desc: 'Monolith response index' },
              { label: 'Avg API Response', val: '14ms', desc: 'Direct Supabase connection' }
            ].map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
                  <Typography variant="h3" fontWeight="900" sx={{ color: '#0d9488', letterSpacing: '-0.02em', mb: 0.5 }}>
                    {stat.val}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a', mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {stat.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Live Status Interactive Widget */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: '24px', 
            bgcolor: '#0f172a', 
            border: 'none', 
            color: '#fff',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)' 
          }}>
            <Grid container spacing={4} alignItems="center">
              {/* Left Column: DB details */}
              <Grid item xs={12} md={5}>
                <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                  {/* Pulsing indicator */}
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: '#22c55e',
                    animation: 'pulseGreen 2.5s infinite ease-in-out',
                    '@keyframes pulseGreen': {
                      '0%': { transform: 'scale(0.9)', opacity: 0.4 },
                      '50%': { transform: 'scale(1.25)', opacity: 1 },
                      '100%': { transform: 'scale(0.9)', opacity: 0.4 }
                    }
                  }} />
                  <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#22c55e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    SUPABASE POSTGRESQL CONNECTED
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 2, letterSpacing: '-0.02em' }}>
                  Live Connection Stream
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6, mb: 3 }}>
                  Your frontend triggers real-time query executions. Commenting out the mock interceptors guarantees that all patient metrics display live server updates.
                </Typography>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>DATABASE MODE</Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#38bdf8' }}>Production Monolith</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>SSL PROTOCOL</Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#38bdf8' }}>TLS 1.3 Active</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Fake Live Terminal Output */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ 
                  bgcolor: '#020617', 
                  p: 3, 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'Consolas, Monaco, monospace',
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  overflowY: 'auto'
                }}>
                  {logLines.map((log, index) => (
                    <Typography key={index} variant="caption" sx={{ color: log.includes('error') ? '#f87171' : log.includes('SELECT') ? '#fbbf24' : '#38bdf8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {log}
                    </Typography>
                  ))}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 'auto', pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" sx={{ color: '#22c55e' }}>sks-hospital:~$</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', animation: 'blink 1s infinite' }}>
                      monitoring database traffic... _
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* ==============================================
          SUPPORT & FAQ SECTION (#support)
          ============================================== */}
      <Box id="support" sx={{ py: 12, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="secondary.main" fontWeight="800" sx={{ letterSpacing: '0.15em' }}>
              HELP & RESOURCES
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 1, mb: 2, color: '#0f172a', letterSpacing: '-0.03em' }}>
              Support Center & FAQ
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxW: '600px', mx: 'auto', fontSize: '17px' }}>
              Have questions about SKS Admin? Read our FAQ resources below.
            </Typography>
          </Box>

          <Box sx={{ maxWidth: '800px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                q: 'How secure is patient clinical records data?',
                a: 'SKS Admin implements strict secure row-level database structures. HIPAA/EMR configuration frameworks ensure clinical documents, diagnostic results, and check-in timelines remain visible only to authenticated doctors.'
              },
              {
                q: 'Can we configure custom roles for billing and nursing staff?',
                a: 'Yes, our platform supports role mapping (ROLE_ADMIN, ROLE_DOCTOR, ROLE_RECEPTIONIST, ROLE_PHARMACIST, ROLE_BILLING_STAFF). Users are dynamically allowed access strictly corresponding to their operational duties.'
              },
              {
                q: 'Does it support database migration pipelines?',
                a: 'Yes, because SKS Admin connects directly to Postgres database layers, standard SQL schema dumps can be migrated through standard Prisma seed pipelines. Contact our technical support for direct migration queries.'
              },
              {
                q: 'Is there direct invoicing and pharmacy logs sync?',
                a: 'Absolutely. A consultation entry or appointment update can instantly issue automated invoicing scripts, which sync patient records to the billing dashboard to keep ledger counts accurate.'
              }
            ].map((faq, index) => (
              <Accordion key={index} sx={{ 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0', 
                boxShadow: 'none',
                '&:before': { display: 'none' },
                overflow: 'hidden',
                bgcolor: '#ffffff',
                '&.Mui-expanded': {
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                  borderColor: '#0d9488'
                }
              }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#0d9488' }} />} sx={{ px: 3, py: 1.5 }}>
                  <Typography fontWeight="800" sx={{ color: '#0f172a' }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ==============================================
          FOOTER
          ============================================== */}
      <Box sx={{ bgcolor: '#0f172a', color: '#94a3b8', pt: 8, pb: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Branding Column */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                <img src="/logo.png" alt="SKS Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.03em', color: '#ffffff' }}>
                  SKS Admin
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 4, color: '#64748b' }}>
                A highly comprehensive, lightning-fast light theme clinical manager built to synchronize patient schedules, doctor rosters, prescriptions, and billing pipelines.
              </Typography>
              <Box display="flex" gap={1.5}>
                {[1, 2, 3].map(item => (
                  <Avatar key={item} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', width: 36, height: 36, cursor: 'pointer', '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>
                    <Star sx={{ fontSize: 16 }} />
                  </Avatar>
                ))}
              </Box>
            </Grid>

            {/* Links Columns */}
            {[
              {
                title: 'Product',
                links: [
                  { label: 'EMR Records', id: 'product' },
                  { label: 'Staff Scheduling', id: 'product' },
                  { label: 'Appointments Tracker', id: 'product' },
                  { label: 'Billing Invoices', id: 'product' }
                ]
              },
              {
                title: 'Service',
                links: [
                  { label: 'Emergency Support', id: 'service' },
                  { label: 'Telehealth Portal', id: 'service' },
                  { label: 'Lab Integration', id: 'service' },
                  { label: 'Ward Management', id: 'service' }
                ]
              },
              {
                title: 'Contact',
                links: [
                  { label: 'Submit Ticket', id: 'support' },
                  { label: 'API Status Docs', id: 'activity' },
                  { label: 'Security Standards', id: 'service' },
                  { label: 'Request Call', id: 'support' }
                ]
              }
            ].map((col, idx) => (
              <Grid item xs={4} md={2} key={idx}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', mb: 3 }}>
                  {col.title}
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {col.links.map((lnk, i) => (
                    <Typography 
                      key={i} 
                      variant="caption" 
                      onClick={() => scrollToSection(lnk.id)}
                      sx={{ 
                        color: '#64748b', 
                        cursor: 'pointer', 
                        '&:hover': { color: '#ffffff' },
                        transition: 'color 0.2s'
                      }}
                    >
                      {lnk.label}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mb: 4 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              &copy; 2026 SKS Hospital Management System. All rights reserved. Registered trademark of SKS Tech Labs.
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Watermark Stamp: Made by Sahil
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;

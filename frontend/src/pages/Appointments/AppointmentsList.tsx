import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField
} from '@mui/material';
import { Add, Visibility, Edit } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { PagedResponse } from '../../types';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
  reason: string;
}

const appointmentSchema = z.object({
  patientName: z.string().min(1, 'Required'),
  doctorName: z.string().min(1, 'Required'),
  appointmentDateTime: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Required')
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const AppointmentsList: React.FC = () => {
  const [page] = React.useState(0); // setPage removed due to unused variable error
  const [status, setStatus] = React.useState('ALL');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedApt, setSelectedApt] = React.useState<Appointment | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const saveApt = useMutation({
    mutationFn: (data: { id?: number, form: AppointmentForm }) => 
      data.id ? api.put(`/appointments/${data.id}`, data.form) : api.post('/appointments', data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      handleCloseModal();
    }
  });

  const onSubmit = (data: AppointmentForm) => saveApt.mutate({ id: selectedApt?.id, form: data });

  const handleOpenModal = (apt?: Appointment) => {
    setSelectedApt(apt || null);
    reset(apt ? {
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      appointmentDateTime: apt.appointmentDateTime.substring(0, 16),
      reason: apt.reason
    } : {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApt(null);
    reset();
  };

  const handleView = (apt: Appointment) => {
    setSelectedApt(apt);
    setIsViewOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, status],
    queryFn: async () => {
      const res = await api.get<{data: PagedResponse<Appointment>}>('/appointments', {
        params: { page, size: 20, status: status !== 'ALL' ? status : undefined }
      });
      return res.data.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'info';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Appointments</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Book Appointment</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={status} label="Filter by Status" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="ALL">All Appointments</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
            ) : data?.content.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No appointments found.</TableCell></TableRow>
            ) : (
              data?.content.map((apt) => (
                <TableRow key={apt.id} hover>
                  <TableCell>#{apt.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{apt.patientName}</TableCell>
                  <TableCell>Dr. {apt.doctorName}</TableCell>
                  <TableCell>
                    {format(new Date(apt.appointmentDateTime), 'MMM dd, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{apt.reason}</TableCell>
                  <TableCell>
                    <Chip size="small" label={apt.status} color={getStatusColor(apt.status) as any} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleView(apt)}><Visibility /></IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenModal(apt)}><Edit /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{selectedApt ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Patient Name" {...register('patientName')} error={!!errors.patientName} helperText={errors.patientName?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Doctor Name" {...register('doctorName')} error={!!errors.doctorName} helperText={errors.doctorName?.message} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Date & Time" type="datetime-local" InputLabelProps={{ shrink: true }} {...register('appointmentDateTime')} error={!!errors.appointmentDateTime} helperText={errors.appointmentDateTime?.message} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Reason" multiline rows={3} {...register('reason')} error={!!errors.reason} helperText={errors.reason?.message} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saveApt.isPending}>{saveApt.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent dividers>
          {selectedApt && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Patient</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedApt.patientName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Doctor</Typography>
                <Typography variant="body1">Dr. {selectedApt.doctorName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
                <Typography variant="body1">{format(new Date(selectedApt.appointmentDateTime), 'MMM dd, yyyy h:mm a')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip size="small" label={selectedApt.status} color={getStatusColor(selectedApt.status) as any} sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                <Typography variant="body1">{selectedApt.reason}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentsList;

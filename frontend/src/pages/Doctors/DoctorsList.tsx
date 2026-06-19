import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, TablePagination, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { PagedResponse } from '../../types';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  available: boolean;
}

const doctorSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Required'),
  specialization: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
});

type DoctorForm = z.infer<typeof doctorSchema>;

const DoctorsList: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<Doctor | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  const saveDoctor = useMutation({
    mutationFn: (data: { id?: number, form: DoctorForm }) => 
      data.id ? api.put(`/doctors/${data.id}`, data.form) : api.post('/doctors', data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      handleCloseModal();
    }
  });

  const onSubmit = (data: DoctorForm) => saveDoctor.mutate({ id: selectedDoc?.id, form: data });

  const handleOpenModal = (doc?: Doctor) => {
    setSelectedDoc(doc || null);
    reset(doc || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoc(null);
    reset();
  };

  const handleView = (doc: Doctor) => {
    setSelectedDoc(doc);
    setIsViewOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, rowsPerPage, search],
    queryFn: async () => {
      const res = await api.get<{data: PagedResponse<Doctor>}>('/doctors', {
        params: { page, size: rowsPerPage, search }
      });
      return res.data.data;
    }
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Doctors Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Add New Doctor</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          size="small" placeholder="Search doctors..." variant="outlined"
          value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 300 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell>Doctor</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : data?.content.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No doctors found.</TableCell></TableRow>
            ) : (
              data?.content.map((doctor) => (
                <TableRow key={doctor.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{doctor.firstName[0]}{doctor.lastName[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">Dr. {doctor.firstName} {doctor.lastName}</Typography>
                        <Typography variant="caption" color="textSecondary">{doctor.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip size="small" label={doctor.specialization} color="primary" variant="outlined" /></TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell>
                    <Chip size="small" label={doctor.available ? 'Available' : 'Unavailable'} color={doctor.available ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleView(doctor)}><Visibility /></IconButton>
                  <IconButton color="secondary" onClick={() => handleOpenModal(doctor)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={data?.totalElements || 0} page={page}
          onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{selectedDoc ? 'Edit Doctor' : 'Register New Doctor'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Specialization" {...register('specialization')} error={!!errors.specialization} helperText={errors.specialization?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Department" {...register('department')} error={!!errors.department} helperText={errors.department?.message} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saveDoctor.isPending}>{saveDoctor.isPending ? 'Saving...' : 'Save Doctor'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Doctor Profile</DialogTitle>
        <DialogContent dividers>
          {selectedDoc && (
            <Grid container spacing={2}>
              <Grid item xs={12} display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 64, height: 64 }}>{selectedDoc.firstName[0]}{selectedDoc.lastName[0]}</Avatar>
                <Box>
                  <Typography variant="h6">Dr. {selectedDoc.firstName} {selectedDoc.lastName}</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedDoc.specialization}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{selectedDoc.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography variant="body1">{selectedDoc.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                <Typography variant="body1">{selectedDoc.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Typography variant="body1">{selectedDoc.available ? 'Available' : 'Unavailable'}</Typography>
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

export default DoctorsList;

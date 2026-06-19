import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, TablePagination, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { PagedResponse } from '../../types';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
}

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

type PatientForm = z.infer<typeof patientSchema>;

const PatientsList: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: 'MALE' }
  });

  const savePatient = useMutation({
    mutationFn: (data: { id?: number, form: PatientForm }) => 
      data.id ? api.put(`/patients/${data.id}`, data.form) : api.post('/patients', data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      handleCloseModal();
    }
  });

  const onSubmit = (data: PatientForm) => savePatient.mutate({ id: selectedPatient?.id, form: data });

  const handleOpenModal = (pat?: Patient) => {
    setSelectedPatient(pat || null);
    reset(pat ? (pat as any) : { gender: 'MALE' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    reset();
  };

  const handleView = (pat: Patient) => {
    setSelectedPatient(pat);
    setIsViewOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, rowsPerPage, search],
    queryFn: async () => {
      const res = await api.get<{data: PagedResponse<Patient>}>('/patients', {
        params: { page, size: rowsPerPage, search }
      });
      return res.data.data;
    }
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Patients Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Add New Patient</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          size="small"
          placeholder="Search patients..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
            ) : data?.content.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No patients found.</TableCell></TableRow>
            ) : (
              data?.content.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>#{patient.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{patient.firstName} {patient.lastName}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>
                    {patient.bloodGroup && (
                      <Chip size="small" label={patient.bloodGroup} color="error" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleView(patient)}><Visibility /></IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenModal(patient)}><Edit /></IconButton>
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
          <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} {...register('dateOfBirth')} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Gender">
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Blood Group (Optional)" {...register('bloodGroup')} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savePatient.isPending}>
              {savePatient.isPending ? 'Saving...' : 'Save Patient'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Patient Profile</DialogTitle>
        <DialogContent dividers>
          {selectedPatient && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                <Typography variant="body1">{selectedPatient.firstName} {selectedPatient.lastName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{selectedPatient.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography variant="body1">{selectedPatient.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                <Typography variant="body1">{selectedPatient.gender}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Blood Group</Typography>
                <Typography variant="body1">{selectedPatient.bloodGroup || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                <Typography variant="body1">{(selectedPatient as any).dateOfBirth || 'N/A'}</Typography>
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

export default PatientsList;

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Divider
} from '@mui/material';
import { Add, Visibility, Edit, Print, Delete } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { PagedResponse } from '../../types';
import { format } from 'date-fns';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: number;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  createdAt: string;
  medicines: Medicine[];
}

const medicineSchema = z.object({
  name: z.string().min(1, 'Required'),
  dosage: z.string().min(1, 'Required'),
  frequency: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
});

const prescriptionSchema = z.object({
  patientName: z.string().min(1, 'Required'),
  doctorName: z.string().min(1, 'Required'),
  diagnosis: z.string().min(1, 'Required'),
  medicines: z.array(medicineSchema).optional(),
});

type PrescriptionForm = z.infer<typeof prescriptionSchema>;

const PrescriptionsList: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedPres, setSelectedPres] = React.useState<Prescription | null>(null);
  
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PrescriptionForm>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { medicines: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines"
  });

  const savePrescription = useMutation({
    mutationFn: (data: { id?: number; form: PrescriptionForm }) => 
      data.id ? api.put(`/prescriptions/${data.id}`, data.form) : api.post('/prescriptions', data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      handleCloseModal();
    }
  });

  const onSubmit = (data: PrescriptionForm) => savePrescription.mutate({ id: selectedPres?.id, form: data });

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', page, rowsPerPage],
    queryFn: () => api.get<{data: PagedResponse<Prescription>}>(`/prescriptions?page=${page}&size=${rowsPerPage}`).then(res => res.data.data),
  });

  const handleOpenModal = (pres?: Prescription) => {
    setSelectedPres(pres || null);
    reset(pres ? { 
      patientName: pres.patientName, 
      doctorName: pres.doctorName, 
      diagnosis: pres.diagnosis, 
      medicines: pres.medicines || [] 
    } : { medicines: [] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPres(null);
    reset();
  };

  const handleView = (pres: Prescription) => {
    setSelectedPres(pres);
    setIsViewOpen(true);
  };

  const printPrescription = () => {
    window.print();
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="no-print">
        <Typography variant="h5" fontWeight="bold">Prescriptions</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Create Prescription</Button>
      </Box>

      <TableContainer component={Paper} className="no-print">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.content.map((pres) => (
              <TableRow key={pres.id}>
                <TableCell>#{pres.id}</TableCell>
                <TableCell>{format(new Date(pres.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{pres.patientName}</TableCell>
                <TableCell>{pres.doctorName}</TableCell>
                <TableCell>{pres.diagnosis}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleView(pres)}><Visibility /></IconButton>
                  <IconButton color="secondary" onClick={() => handleOpenModal(pres)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={data?.totalElements || 0} page={page}
          onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth className="no-print">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{selectedPres ? 'Edit Prescription' : 'Create Prescription'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Patient Name" {...register('patientName')} error={!!errors.patientName} helperText={errors.patientName?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Doctor Name" {...register('doctorName')} error={!!errors.doctorName} helperText={errors.doctorName?.message} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Diagnosis" multiline rows={2} {...register('diagnosis')} error={!!errors.diagnosis} helperText={errors.diagnosis?.message} /></Grid>
              
              <Grid item xs={12}>
                <Box mt={2} mb={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Medicines</Typography>
                  <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })}>Add Medicine</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {fields.map((field, index) => (
                  <Grid container spacing={2} key={field.id} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Drug Name" {...register(`medicines.${index}.name` as const)} error={!!errors.medicines?.[index]?.name} /></Grid>
                    <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Dosage (e.g. 500mg)" {...register(`medicines.${index}.dosage` as const)} error={!!errors.medicines?.[index]?.dosage} /></Grid>
                    <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Frequency (e.g. 1-0-1)" {...register(`frequencies.${index}.frequency` as any)} {...register(`medicines.${index}.frequency` as const)} error={!!errors.medicines?.[index]?.frequency} /></Grid>
                    <Grid item xs={12} sm={2}><TextField fullWidth size="small" label="Duration" {...register(`medicines.${index}.duration` as const)} error={!!errors.medicines?.[index]?.duration} /></Grid>
                    <Grid item xs={12} sm={1}><IconButton color="error" onClick={() => remove(index)}><Delete /></IconButton></Grid>
                  </Grid>
                ))}
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savePrescription.isPending}>{savePrescription.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Real-World Prescription Pad Modal */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, '@media print': { overflow: 'visible', height: '100vh', width: '100vw' } }}>
          <Box p={5} sx={{ minHeight: '600px', backgroundColor: '#fff', color: '#000' }} className="print-container">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" borderBottom="2px solid #1976d2" pb={2} mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <img src="/logo.png" alt="SKS Hospital Logo" style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
                <Box>
                  <Typography variant="h4" color="primary" fontWeight="bold" sx={{ fontFamily: 'serif', color: '#000' }}>SKS HOSPITAL</Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>Kolkata, West Bengal, India</Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>Phone: 033-2414-6532 | Web: www.skshospital.com</Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#000' }}>Dr. {selectedPres?.doctorName}</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>Physician / Consultant</Typography>
                <Typography variant="body2" mt={1} sx={{ color: '#333' }}>Date: {selectedPres && format(new Date(selectedPres.createdAt), 'MMMM dd, yyyy')}</Typography>
              </Box>
            </Box>

            <div className="hospital-stamp-print">SKS HOSPITAL</div>

            {/* Patient Info */}
            <Box mb={4}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="body1"><strong>Patient Name:</strong> {selectedPres?.patientName}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1"><strong>Prescription ID:</strong> #{selectedPres?.id}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Diagnosis:</strong> {selectedPres?.diagnosis}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Rx Symbol */}
            <Typography variant="h3" sx={{ fontFamily: 'serif', mb: 2, fontStyle: 'italic' }}>℞</Typography>

            {/* Medicines List */}
            <Box minHeight="250px">
              {selectedPres?.medicines && selectedPres.medicines.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Medicine Name</strong></TableCell>
                      <TableCell><strong>Dosage</strong></TableCell>
                      <TableCell><strong>Frequency</strong></TableCell>
                      <TableCell><strong>Duration</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPres.medicines.map((med, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body1" color="textSecondary" fontStyle="italic">No medicines prescribed.</Typography>
              )}
            </Box>

            {/* Footer */}
            <Box mt={4} borderTop="1px solid #ccc" pt={2} display="flex" justifyContent="space-between" alignItems="flex-end">
              <Typography variant="caption" sx={{ color: '#555' }}>This is a system generated prescription.</Typography>
              <Box textAlign="center" width="200px">
                <Typography variant="h5" sx={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive', color: '#1976d2', mb: 1, transform: 'rotate(-5deg)' }}>
                  {selectedPres?.doctorName}
                </Typography>
                <Divider sx={{ mb: 1, borderColor: '#000' }} />
                <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold' }}>Doctor's Signature</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={printPrescription}>Print</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionsList;

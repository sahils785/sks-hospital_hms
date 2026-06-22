import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField
} from '@mui/material';
import { Add, Visibility, Edit, GetApp } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { PagedResponse } from '../../types';
import { format } from 'date-fns';

interface Invoice {
  id: number;
  patientName: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
}

const invoiceSchema = z.object({
  patientName: z.string().min(1, 'Required'),
  totalAmount: z.number().min(1, 'Required'),
  finalAmount: z.number().min(1, 'Required')
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

const BillingList: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedInv, setSelectedInv] = React.useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
  });

  const saveInvoice = useMutation({
    mutationFn: (data: { id?: number, form: InvoiceForm }) => 
      data.id ? api.put(`/billing/invoices/${data.id}`, data.form) : api.post('/billing/invoices', data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      handleCloseModal();
    }
  });

  const onSubmit = (data: InvoiceForm) => saveInvoice.mutate({ id: selectedInv?.id, form: data });

  const handleOpenModal = (inv?: Invoice) => {
    setSelectedInv(inv || null);
    reset(inv ? {
      patientName: inv.patientName,
      totalAmount: inv.totalAmount,
      finalAmount: inv.finalAmount
    } : {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInv(null);
    reset();
  };

  const handleView = (inv: Invoice) => {
    setSelectedInv(inv);
    setIsViewOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, rowsPerPage],
    queryFn: async () => {
      const res = await api.get<{data: PagedResponse<Invoice>}>('/billing/invoices', {
        params: { page, size: rowsPerPage }
      });
      return res.data.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Billing & Invoices</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Create Invoice</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Final Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
            ) : data?.content.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No invoices found.</TableCell></TableRow>
            ) : (
              data?.content.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>#{inv.id}</TableCell>
                  <TableCell>{format(new Date(inv.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{inv.patientName}</TableCell>
                  <TableCell>₹{Number(inv.totalAmount || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>₹{Number(inv.finalAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={inv.status} color={getStatusColor(inv.status) as any} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleView(inv)}><Visibility /></IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenModal(inv)}><Edit /></IconButton>
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
          <DialogTitle>{selectedInv ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Patient Name" {...register('patientName')} error={!!errors.patientName} helperText={errors.patientName?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Total Amount (₹)" type="number" {...register('totalAmount', { valueAsNumber: true })} error={!!errors.totalAmount} helperText={errors.totalAmount?.message} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Final Amount (₹)" type="number" {...register('finalAmount', { valueAsNumber: true })} error={!!errors.finalAmount} helperText={errors.finalAmount?.message} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saveInvoice.isPending}>{saveInvoice.isPending ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="no-print">Invoice Details</DialogTitle>
        <DialogContent dividers>
          {selectedInv && (
            <Box className="print-container" sx={{ p: 2, bgcolor: '#fff', color: '#000' }}>
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
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2' }}>INVOICE</Typography>
                  <Typography variant="body2" mt={1} sx={{ color: '#333' }}>Date: {format(new Date(selectedInv.createdAt), 'MMMM dd, yyyy')}</Typography>
                </Box>
              </Box>

              {selectedInv.status === 'PAID' && (
                <div className="hospital-stamp-print" style={{ color: 'rgba(34, 197, 94, 0.3)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                  SKS HOSPITAL<br/>PAID IN FULL
                </div>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>Invoice Number</Typography>
                  <Typography variant="body1" sx={{ color: '#000' }}>INV-{selectedInv.id.toString().padStart(5, '0')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>Date</Typography>
                  <Typography variant="body1" sx={{ color: '#000' }}>{format(new Date(selectedInv.createdAt), 'MMM dd, yyyy')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>Patient Name</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: '#000' }}>{selectedInv.patientName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>Status</Typography>
                  <Chip size="small" label={selectedInv.status} color={getStatusColor(selectedInv.status) as any} sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>
              <Box mt={4} p={2} bgcolor="#f8fafc" borderRadius={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" sx={{ color: '#000' }}>Total Amount</Typography>
                  <Typography variant="body1" sx={{ color: '#000' }}>₹{Number(selectedInv.totalAmount || 0).toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" sx={{ color: '#000' }}>Discount / Adjustments</Typography>
                  <Typography variant="body1" sx={{ color: '#000' }}>₹{(Number(selectedInv.totalAmount || 0) - Number(selectedInv.finalAmount || 0)).toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop="1px solid #e2e8f0">
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#000' }}>Final Amount</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2' }}>₹{Number(selectedInv.finalAmount || 0).toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<GetApp />} onClick={() => window.print()}>Download PDF</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingList;

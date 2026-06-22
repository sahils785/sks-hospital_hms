import MockAdapter from 'axios-mock-adapter';
import api from './axios';

const mock = new MockAdapter(api, { delayResponse: 500 });

// Mock state
let patients = [
  { id: 1, firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com', phone: '9830012345', gender: 'MALE', bloodGroup: 'O+' },
  { id: 2, firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com', phone: '9830054321', gender: 'FEMALE', bloodGroup: 'A-' }
];

let nextPatientId = 3;
let nextDoctorId = 2;
let nextAppointmentId = 2;
let nextPrescriptionId = 2;
let nextInvoiceId = 2;

let doctors = [
  { id: 1, firstName: 'Rakesh', lastName: 'Singh', email: 'rakesh@example.com', phone: '9831122334', specialization: 'Cardiology', department: 'Heart Center', available: true },
];

let appointments = [
  { id: 1, patientName: 'Rahul Sharma', doctorName: 'Rakesh Singh', appointmentDateTime: '2026-06-20T10:00:00Z', status: 'SCHEDULED', reason: 'Routine Checkup' }
];

let prescriptions = [
  { 
    id: 1, patientName: 'Rahul Sharma', doctorName: 'Rakesh Singh', diagnosis: 'Hypertension', createdAt: '2026-06-15T09:00:00Z',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once a day', duration: '30 days' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day', duration: '30 days' }
    ]
  }
];

let invoices = [
  { id: 1, patientName: 'Priya Patel', totalAmount: 150.00, finalAmount: 150.00, status: 'PAID', createdAt: '2026-06-14T14:30:00Z' }
];

// Mock login (already mocked in Login.tsx try/catch, but let's mock it here too)
mock.onPost('/auth/login').reply(200, {
  data: {
    id: 1, username: 'admin', email: 'admin@hospital.com', roles: ['ROLE_ADMIN'], accessToken: 'mock-token', refreshToken: 'mock-refresh'
  }
});

// Mock analytics dashboard
mock.onGet('/analytics/dashboard').reply(200, {
  data: {
    metrics: {
      totalPatients: 1420,
      totalDoctors: 48,
      totalAppointments: 18,
      completedAppointments: 12,
      pendingInvoices: 4,
      totalRevenue: 24850.00
    },
    charts: {
      revenueHistory: [
        { month: 'Jan', revenue: 15200 },
        { month: 'Feb', revenue: 18400 },
        { month: 'Mar', revenue: 16800 },
        { month: 'Apr', revenue: 21900 },
        { month: 'May', revenue: 23100 },
        { month: 'Jun', revenue: 24850 }
      ]
    },
    recentAppointments: [
      { patientName: 'Rahul Sharma', doctorName: 'Dr. Rakesh Singh', status: 'SCHEDULED', appointmentDateTime: new Date().toISOString() },
      { patientName: 'Amit Verma', doctorName: 'Dr. Priya Patel', status: 'CONFIRMED', appointmentDateTime: new Date(Date.now() + 3600000).toISOString() },
      { patientName: 'Sneha Reddy', doctorName: 'Dr. Rakesh Singh', status: 'COMPLETED', appointmentDateTime: new Date(Date.now() - 7200000).toISOString() }
    ]
  }
});

// Patients endpoints
mock.onGet(/\/patients\/\d+/).reply(() => {
  return [200, { data: patients[0] }];
});
mock.onGet(/\/patients.*/).reply(() => {
  return [200, {
    data: {
      content: patients,
      totalElements: patients.length,
      totalPages: 1,
      page: 0,
      size: 10,
      last: true
    }
  }];
});

mock.onPost('/patients').reply(config => {
  const newPatient = JSON.parse(config.data);
  newPatient.id = nextPatientId++;
  patients.unshift(newPatient); // Add to front
  return [201, { data: newPatient }];
});

// Doctors endpoints
mock.onGet(/\/doctors\/\d+/).reply(() => {
  return [200, { data: doctors[0] }];
});
mock.onGet(/\/doctors.*/).reply(() => {
  return [200, { data: { content: doctors, totalElements: doctors.length, totalPages: 1, page: 0, size: 10, last: true } }];
});
mock.onPost('/doctors').reply(config => {
  const newDoctor = JSON.parse(config.data);
  newDoctor.id = nextDoctorId++;
  newDoctor.available = true;
  doctors.unshift(newDoctor);
  return [201, { data: newDoctor }];
});

// Appointments endpoints
mock.onGet(/\/appointments.*/).reply(() => {
  return [200, { data: { content: appointments, totalElements: appointments.length, totalPages: 1, page: 0, size: 10, last: true } }];
});
mock.onPost('/appointments').reply(config => {
  const newApt = JSON.parse(config.data);
  newApt.id = nextAppointmentId++;
  newApt.status = 'SCHEDULED';
  appointments.unshift(newApt);
  return [201, { data: newApt }];
});

// Prescriptions endpoints
mock.onGet(/\/prescriptions.*/).reply(() => {
  return [200, { data: { content: prescriptions, totalElements: prescriptions.length, totalPages: 1, page: 0, size: 10, last: true } }];
});
mock.onPost('/prescriptions').reply(config => {
  const newPres = JSON.parse(config.data);
  newPres.id = nextPrescriptionId++;
  newPres.createdAt = new Date().toISOString();
  prescriptions.unshift(newPres);
  return [201, { data: newPres }];
});

// Billing endpoints
mock.onGet(/\/billing\/invoices.*/).reply(() => {
  return [200, { data: { content: invoices, totalElements: invoices.length, totalPages: 1, page: 0, size: 10, last: true } }];
});
mock.onPost('/billing/invoices').reply(config => {
  const newInv = JSON.parse(config.data);
  newInv.id = nextInvoiceId++;
  newInv.createdAt = new Date().toISOString();
  newInv.status = 'PENDING';
  invoices.unshift(newInv);
  return [201, { data: newInv }];
});

// Generic PUT handler for all entities
const handlePut = (entityList: any[]) => (config: any): [number, any] => {
  const idStr = config.url.split('/').pop();
  const id = parseInt(idStr, 10);
  const updatedData = JSON.parse(config.data);
  const index = entityList.findIndex(e => e.id === id);
  if (index !== -1) {
    entityList[index] = { ...entityList[index], ...updatedData };
    return [200, { data: entityList[index] }];
  }
  return [404, { error: 'Not found' }];
};

mock.onPut(/\/patients\/\d+/).reply(handlePut(patients));
mock.onPut(/\/doctors\/\d+/).reply(handlePut(doctors));
mock.onPut(/\/appointments\/\d+/).reply(handlePut(appointments));
mock.onPut(/\/prescriptions\/\d+/).reply(handlePut(prescriptions));
mock.onPut(/\/billing\/invoices\/\d+/).reply(handlePut(invoices));

export default mock;

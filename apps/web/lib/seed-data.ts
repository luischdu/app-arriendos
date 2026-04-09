/** Datos demo que se insertan cuando la base de datos Blob está vacía */

export const SEED_PROPERTIES = [
  {
    id: 'p1', code: 'AP-301', name: 'Apto 301 Laureles', propertyType: 'apartamento',
    address: 'Cra 70 #45-20, Apto 301', city: 'Medellín', department: 'Antioquia',
    stratum: 4, areaSqm: 72, rooms: 3, bathrooms: 2, parkingSpots: 1,
    status: 'rented', monthlyRent: 1200000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p2', code: 'CS-001', name: 'Casa El Poblado', propertyType: 'casa',
    address: 'Cll 10 #34-15', city: 'Medellín', department: 'Antioquia',
    stratum: 6, areaSqm: 180, rooms: 4, bathrooms: 3, parkingSpots: 2,
    status: 'rented', monthlyRent: 2500000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p3', code: 'LC-105', name: 'Local 105 Centro', propertyType: 'local',
    address: 'Av. El Dorado #22-10', city: 'Bogotá', department: 'Cundinamarca',
    stratum: 0, areaSqm: 45, rooms: 0, bathrooms: 1, parkingSpots: 0,
    status: 'rented', monthlyRent: 1800000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p4', code: 'AP-202', name: 'Apto 202 Envigado', propertyType: 'apartamento',
    address: 'Cra 43A #34-60', city: 'Envigado', department: 'Antioquia',
    stratum: 3, areaSqm: 58, rooms: 2, bathrooms: 1, parkingSpots: 1,
    status: 'rented', monthlyRent: 950000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p5', code: 'AP-503', name: 'Apto 503 Laureles', propertyType: 'apartamento',
    address: 'Cll 76 #80-12, Apto 503', city: 'Medellín', department: 'Antioquia',
    stratum: 4, areaSqm: 65, rooms: 2, bathrooms: 2, parkingSpots: 1,
    status: 'available', monthlyRent: 1100000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p6', code: 'BD-001', name: 'Bodega Guayabal', propertyType: 'bodega',
    address: 'Cra 52 #10-30', city: 'Medellín', department: 'Antioquia',
    stratum: 0, areaSqm: 250, rooms: 0, bathrooms: 1, parkingSpots: 4,
    status: 'maintenance', monthlyRent: 3200000, createdAt: '2024-01-01T00:00:00Z',
  },
];

export const SEED_RENTERS = [
  {
    id: 'r1', fullName: 'Carlos Mendoza', cedula: '1023456789',
    email: 'carlos.mendoza@email.com', phone: '3001234567',
    status: 'active', since: '2024-02-01', createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'r2', fullName: 'Ana García', cedula: '43876543',
    email: 'ana.garcia@email.com', phone: '3157654321',
    status: 'active', since: '2023-09-15', createdAt: '2023-09-01T00:00:00Z',
  },
  {
    id: 'r3', fullName: 'Pedro Ramírez', cedula: '71234567',
    email: 'pedro.ramirez@email.com', phone: '3143218765',
    status: 'overdue', since: '2024-01-01', createdAt: '2023-12-20T00:00:00Z',
  },
  {
    id: 'r4', fullName: 'Sofía Torres', cedula: '1152345678',
    email: 'sofia.torres@email.com', phone: '3209876543',
    status: 'active', since: '2024-06-01', createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'r5', fullName: 'Miguel Herrera', cedula: '98765432',
    email: 'miguel.herrera@email.com', phone: '3112345678',
    status: 'pending', since: '2026-04-01', createdAt: '2026-03-01T00:00:00Z',
  },
];

export const SEED_CONTRACTS = [
  {
    id: 'c1', code: 'CON-2024-001',
    renterId: 'r1', propertyId: 'p1',
    renterName: 'Carlos Mendoza', propertyName: 'Apto 301 Laureles',
    startDate: '2024-02-01', endDate: '2025-02-01',
    monthlyRent: 1200000, deposit: 2400000,
    incrementPct: 5, paymentDay: 5, status: 'active', createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'c2', code: 'CON-2023-004',
    renterId: 'r2', propertyId: 'p2',
    renterName: 'Ana García', propertyName: 'Casa El Poblado',
    startDate: '2023-09-15', endDate: '2024-09-15',
    monthlyRent: 2500000, deposit: 5000000,
    incrementPct: 8, paymentDay: 10, status: 'active', createdAt: '2023-09-10T00:00:00Z',
  },
  {
    id: 'c3', code: 'CON-2024-002',
    renterId: 'r3', propertyId: 'p3',
    renterName: 'Pedro Ramírez', propertyName: 'Local 105 Centro',
    startDate: '2024-01-01', endDate: '2025-01-01',
    monthlyRent: 1800000, deposit: 3600000,
    incrementPct: 5, paymentDay: 3, status: 'active', createdAt: '2023-12-28T00:00:00Z',
  },
  {
    id: 'c4', code: 'CON-2024-003',
    renterId: 'r4', propertyId: 'p4',
    renterName: 'Sofía Torres', propertyName: 'Apto 202 Envigado',
    startDate: '2024-06-01', endDate: '2025-06-01',
    monthlyRent: 950000, deposit: 1900000,
    incrementPct: 5, paymentDay: 5, status: 'active', createdAt: '2024-05-25T00:00:00Z',
  },
  {
    id: 'c5', code: 'CON-2026-001',
    renterId: 'r5', propertyId: 'p5',
    renterName: 'Miguel Herrera', propertyName: 'Apto 503 Laureles',
    startDate: '2026-04-01', endDate: '2027-04-01',
    monthlyRent: 1100000, deposit: 2200000,
    incrementPct: 5, paymentDay: 5, status: 'pending', createdAt: '2026-03-15T00:00:00Z',
  },
];

export const SEED_PAYMENTS = [
  {
    id: 'pay1', contractId: 'c1', renterId: 'r1', propertyId: 'p1',
    renterName: 'Carlos Mendoza', propertyName: 'Apto 301 Laureles',
    dueDate: '2026-04-05', paidDate: '2026-03-31', amount: 1200000, lateFee: 0,
    status: 'paid', method: 'Transferencia', notes: '', createdAt: '2026-03-31T00:00:00Z',
  },
  {
    id: 'pay2', contractId: 'c2', renterId: 'r2', propertyId: 'p2',
    renterName: 'Ana García', propertyName: 'Casa El Poblado',
    dueDate: '2026-04-10', paidDate: '2026-03-30', amount: 2500000, lateFee: 0,
    status: 'paid', method: 'PSE', notes: '', createdAt: '2026-03-30T00:00:00Z',
  },
  {
    id: 'pay3', contractId: 'c3', renterId: 'r3', propertyId: 'p3',
    renterName: 'Pedro Ramírez', propertyName: 'Local 105 Centro',
    dueDate: '2026-03-03', paidDate: null, amount: 1800000, lateFee: 90000,
    status: 'overdue', method: null, notes: '', createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'pay4', contractId: 'c4', renterId: 'r4', propertyId: 'p4',
    renterName: 'Sofía Torres', propertyName: 'Apto 202 Envigado',
    dueDate: '2026-04-05', paidDate: null, amount: 950000, lateFee: 0,
    status: 'pending', method: null, notes: '', createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'pay5', contractId: 'c1', renterId: 'r1', propertyId: 'p1',
    renterName: 'Carlos Mendoza', propertyName: 'Apto 301 Laureles',
    dueDate: '2026-03-05', paidDate: '2026-03-04', amount: 1200000, lateFee: 0,
    status: 'paid', method: 'Transferencia', notes: '', createdAt: '2026-03-04T00:00:00Z',
  },
  {
    id: 'pay6', contractId: 'c2', renterId: 'r2', propertyId: 'p2',
    renterName: 'Ana García', propertyName: 'Casa El Poblado',
    dueDate: '2026-03-10', paidDate: '2026-03-09', amount: 2500000, lateFee: 0,
    status: 'paid', method: 'PSE', notes: '', createdAt: '2026-03-09T00:00:00Z',
  },
  {
    id: 'pay7', contractId: 'c3', renterId: 'r3', propertyId: 'p3',
    renterName: 'Pedro Ramírez', propertyName: 'Local 105 Centro',
    dueDate: '2026-02-03', paidDate: '2026-02-10', amount: 1800000, lateFee: 54000,
    status: 'paid', method: 'Efectivo', notes: 'Pago tardío con mora', createdAt: '2026-02-10T00:00:00Z',
  },
];

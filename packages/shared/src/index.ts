// Tipos compartidos ArriendosPRO

export type PlanType = 'starter' | 'pro' | 'business' | 'enterprise';
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'viewer' | 'renter';
export type PropertyType = 'apartamento' | 'casa' | 'local' | 'bodega' | 'oficina';
export type PropertyStatus = 'available' | 'rented' | 'maintenance';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type ContractStatus = 'active' | 'terminated' | 'expired' | 'pending';

export interface Tenant {
  id: string;
  name: string;
  nit?: string;
  email: string;
  phone?: string;
  plan: PlanType;
  maxProperties: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  tenantId: string;
  code?: string;
  name?: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  department?: string;
  stratum?: number;
  areaSqm?: number;
  rooms?: number;
  bathrooms?: number;
  parkingSpots: number;
  hasAdministration: boolean;
  adminFee: number;
  status: PropertyStatus;
  photos: string[];
  createdAt: string;
}

export interface Renter {
  id: string;
  tenantId: string;
  fullName: string;
  cedula: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  propertyId: string;
  renterId: string;
  property?: Property;
  renter?: Renter;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  incrementPct: number;
  paymentDayOfMonth: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  contractId: string;
  contract?: Contract;
  dueDate: string;
  paidDate?: string;
  amount: number;
  lateFee: number;
  status: PaymentStatus;
  method?: string;
  notes?: string;
}

export interface DashboardStats {
  totalProperties: number;
  rentedProperties: number;
  totalRenters: number;
  monthlyRevenue: number;
  overdueCount: number;
  occupancyRate: number;
}

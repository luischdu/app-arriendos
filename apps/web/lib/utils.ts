import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como pesos colombianos */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formatea fecha en español colombiano */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/** Calcula días de mora */
export function daysOverdue(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diff = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/** Valida cédula colombiana básica */
export function isValidCedula(cedula: string): boolean {
  return /^\d{5,10}$/.test(cedula.replace(/\./g, ''));
}

/** Valida NIT colombiano básico */
export function isValidNIT(nit: string): boolean {
  return /^\d{9,10}(-\d)?$/.test(nit.replace(/\./g, ''));
}

/** Iniciales para avatar */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export type StatusPayment = 'pending' | 'paid' | 'overdue' | 'partial';

export const STATUS_LABELS: Record<StatusPayment, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  overdue: 'En mora',
  partial: 'Parcial',
};

export const STATUS_COLORS: Record<StatusPayment, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  partial: 'bg-accent/10 text-accent-foreground border-accent/20',
};

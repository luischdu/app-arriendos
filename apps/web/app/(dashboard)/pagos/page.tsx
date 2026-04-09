'use client';

import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCOP, formatDateShort, daysOverdue } from '@/lib/utils';

const PAYMENTS = [
  {
    id: '1', renter: 'Carlos Mendoza', property: 'Apto 301 - Laureles',
    dueDate: '2026-04-05', paidDate: '2026-03-31', amount: 1200000, lateFee: 0,
    status: 'paid', method: 'Transferencia',
  },
  {
    id: '2', renter: 'Ana García', property: 'Casa El Poblado',
    dueDate: '2026-04-10', paidDate: '2026-03-30', amount: 2500000, lateFee: 0,
    status: 'paid', method: 'PSE',
  },
  {
    id: '3', renter: 'Pedro Ramírez', property: 'Local 105 - Centro',
    dueDate: '2026-03-03', paidDate: null, amount: 1800000, lateFee: 90000,
    status: 'overdue', method: null,
  },
  {
    id: '4', renter: 'Sofía Torres', property: 'Apto 202 - Envigado',
    dueDate: '2026-04-05', paidDate: null, amount: 950000, lateFee: 0,
    status: 'pending', method: null,
  },
  {
    id: '5', renter: 'Carlos Mendoza', property: 'Apto 301 - Laureles',
    dueDate: '2026-03-05', paidDate: '2026-03-04', amount: 1200000, lateFee: 0,
    status: 'paid', method: 'Transferencia',
  },
  {
    id: '6', renter: 'Ana García', property: 'Casa El Poblado',
    dueDate: '2026-03-10', paidDate: '2026-03-09', amount: 2500000, lateFee: 0,
    status: 'paid', method: 'PSE',
  },
  {
    id: '7', renter: 'Pedro Ramírez', property: 'Local 105 - Centro',
    dueDate: '2026-02-03', paidDate: '2026-02-10', amount: 1800000, lateFee: 54000,
    status: 'paid', method: 'Efectivo',
  },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default'; icon: typeof CheckCircle2 }> = {
  paid: { label: 'Pagado', variant: 'success', icon: CheckCircle2 },
  overdue: { label: 'En mora', variant: 'destructive', icon: AlertCircle },
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  partial: { label: 'Parcial', variant: 'warning', icon: Clock },
};

export default function PagosPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const filtered = PAYMENTS.filter((p) => {
    const matchSearch =
      p.renter.toLowerCase().includes(search.toLowerCase()) ||
      p.property.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRecaudado = PAYMENTS.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalMora = PAYMENTS.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount + p.lateFee, 0);
  const totalPendiente = PAYMENTS.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Pagos"
        subtitle="Gestión de recaudo"
        action={
          <Button size="sm" variant="outline">
            Exportar
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="stat-card-gold">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recaudado (este mes)</p>
              <p className="text-xl font-semibold text-foreground mt-1">{formatCOP(totalRecaudado)}</p>
              <p className="text-xs text-success mt-1">
                {PAYMENTS.filter((p) => p.status === 'paid').length} pagos confirmados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">En mora</p>
              <p className="text-xl font-semibold text-destructive mt-1">{formatCOP(totalMora)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {PAYMENTS.filter((p) => p.status === 'overdue').length} pagos vencidos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Por cobrar</p>
              <p className="text-xl font-semibold text-warning mt-1">{formatCOP(totalPendiente)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {PAYMENTS.filter((p) => p.status === 'pending').length} pagos pendientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar arrendatario o propiedad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1.5">
            {(['all', 'pending', 'overdue', 'paid'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="h-8 text-xs"
              >
                {{ all: 'Todos', pending: 'Pendientes', overdue: 'En mora', paid: 'Pagados' }[f]}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Historial de pagos</CardTitle>
            <CardDescription>{filtered.length} registros</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Propiedad</th>
                  <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Vencimiento</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                  <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const s = STATUS_MAP[p.status];
                  const days = p.status === 'overdue' ? daysOverdue(p.dueDate) : 0;
                  return (
                    <tr key={p.id} className="table-row-hover border-b border-border last:border-0">
                      <td className="px-6 py-3 font-medium text-foreground">{p.renter}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{p.property}</td>
                      <td className="px-6 py-3 text-right">
                        <p className="font-medium">{formatCOP(p.amount)}</p>
                        {p.lateFee > 0 && (
                          <p className="text-xs text-destructive">+{formatCOP(p.lateFee)} mora</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                        {formatDateShort(p.dueDate)}
                        {days > 0 && (
                          <p className="text-destructive">{days} días vencido</p>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {p.status === 'pending' || p.status === 'overdue' ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Registrar
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Ver
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">Sin resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { FileText, Plus, CalendarDays, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCOP, formatDateShort } from '@/lib/utils';

const CONTRACTS = [
  {
    id: '1', code: 'CON-2024-001',
    renter: 'Carlos Mendoza', property: 'Apto 301 - Laureles',
    startDate: '2024-02-01', endDate: '2025-02-01',
    monthlyRent: 1200000, deposit: 2400000,
    incrementPct: 5, paymentDay: 5, status: 'active',
  },
  {
    id: '2', code: 'CON-2023-004',
    renter: 'Ana García', property: 'Casa El Poblado',
    startDate: '2023-09-15', endDate: '2024-09-15',
    monthlyRent: 2500000, deposit: 5000000,
    incrementPct: 8, paymentDay: 10, status: 'active',
  },
  {
    id: '3', code: 'CON-2024-002',
    renter: 'Pedro Ramírez', property: 'Local 105 - Centro',
    startDate: '2024-01-01', endDate: '2025-01-01',
    monthlyRent: 1800000, deposit: 3600000,
    incrementPct: 5, paymentDay: 3, status: 'active',
  },
  {
    id: '4', code: 'CON-2024-003',
    renter: 'Sofía Torres', property: 'Apto 202 - Envigado',
    startDate: '2024-06-01', endDate: '2025-06-01',
    monthlyRent: 950000, deposit: 1900000,
    incrementPct: 5, paymentDay: 5, status: 'active',
  },
  {
    id: '5', code: 'CON-2026-001',
    renter: 'Miguel Herrera', property: 'Apto 503 - Laureles',
    startDate: '2026-04-01', endDate: '2027-04-01',
    monthlyRent: 1100000, deposit: 2200000,
    incrementPct: 5, paymentDay: 5, status: 'pending',
  },
  {
    id: '6', code: 'CON-2022-001',
    renter: 'Luis Restrepo', property: 'Apto 101 - Centro',
    startDate: '2022-01-01', endDate: '2023-01-01',
    monthlyRent: 800000, deposit: 1600000,
    incrementPct: 5, paymentDay: 5, status: 'terminated',
  },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' | 'secondary' }> = {
  active: { label: 'Vigente', variant: 'success' },
  pending: { label: 'Por iniciar', variant: 'warning' },
  terminated: { label: 'Terminado', variant: 'secondary' },
  expired: { label: 'Vencido', variant: 'destructive' },
};

export default function ContratosPage() {
  const [search, setSearch] = useState('');

  const filtered = CONTRACTS.filter(
    (c) =>
      c.renter.toLowerCase().includes(search.toLowerCase()) ||
      c.property.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const active = CONTRACTS.filter((c) => c.status === 'active');

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Contratos"
        subtitle={`${active.length} contratos vigentes`}
        action={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo contrato
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Vigentes', value: CONTRACTS.filter((c) => c.status === 'active').length },
            { label: 'Por iniciar', value: CONTRACTS.filter((c) => c.status === 'pending').length },
            { label: 'Terminados', value: CONTRACTS.filter((c) => c.status === 'terminated').length },
            {
              label: 'Canon total',
              value: formatCOP(active.reduce((s, c) => s + c.monthlyRent, 0)),
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por arrendatario, propiedad o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Contratos de arrendamiento</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Código</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Propiedad</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Vigencia</th>
                  <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground hidden sm:table-cell">Canon</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const s = STATUS_MAP[c.status];
                  return (
                    <tr key={c.id} className="table-row-hover border-b border-border last:border-0">
                      <td className="px-6 py-3">
                        <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                      </td>
                      <td className="px-6 py-3 font-medium text-foreground">{c.renter}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{c.property}</td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDateShort(c.startDate)} → {formatDateShort(c.endDate)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <TrendingUp className="h-3 w-3" />
                          Incremento {c.incrementPct}% · Pago día {c.paymentDay}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-medium hidden sm:table-cell">
                        {formatCOP(c.monthlyRent)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">Sin resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

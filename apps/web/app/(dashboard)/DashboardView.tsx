'use client';

import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCOP, formatDateShort } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data para desarrollo
const STATS = [
  {
    label: 'Propiedades activas',
    value: '12',
    change: '+2 este mes',
    positive: true,
    icon: Building2,
    accent: true,
  },
  {
    label: 'Arrendatarios',
    value: '11',
    change: '+1 este mes',
    positive: true,
    icon: Users,
  },
  {
    label: 'Recaudo mensual',
    value: formatCOP(8_450_000),
    change: '+5.2% vs mes anterior',
    positive: true,
    icon: TrendingUp,
  },
  {
    label: 'En mora',
    value: '2',
    change: 'Requieren atención',
    positive: false,
    icon: AlertCircle,
  },
];

const CASH_FLOW = [
  { mes: 'Ene', recaudo: 7200000, esperado: 8000000 },
  { mes: 'Feb', recaudo: 7800000, esperado: 8000000 },
  { mes: 'Mar', recaudo: 8100000, esperado: 8200000 },
  { mes: 'Abr', recaudo: 7600000, esperado: 8200000 },
  { mes: 'May', recaudo: 8200000, esperado: 8400000 },
  { mes: 'Jun', recaudo: 8450000, esperado: 8400000 },
];

const RECENT_PAYMENTS = [
  { id: '1', renter: 'Carlos Mendoza', property: 'Apto 301 - Laureles', amount: 1200000, date: '2026-03-31', status: 'paid' },
  { id: '2', renter: 'Ana García', property: 'Casa El Poblado', amount: 2500000, date: '2026-03-30', status: 'paid' },
  { id: '3', renter: 'Pedro Ramírez', property: 'Local 105 - Centro', amount: 1800000, date: '2026-03-28', status: 'overdue' },
  { id: '4', renter: 'Sofía Torres', property: 'Apto 202 - Envigado', amount: 950000, date: '2026-03-27', status: 'pending' },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  paid: { label: 'Pagado', variant: 'success' },
  overdue: { label: 'En mora', variant: 'destructive' },
  pending: { label: 'Pendiente', variant: 'warning' },
};

export default function DashboardView() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Resumen" subtitle="Abril 2026" />

      <div className="page-container space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className={stat.accent ? 'stat-card-gold' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.accent ? 'bg-[hsl(var(--gold-muted))]' : 'bg-muted'}`}>
                    <stat.icon className={`h-4 w-4 ${stat.accent ? 'text-[hsl(var(--gold))]' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {stat.positive ? (
                    <ArrowUpRight className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-xs ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Cash Flow Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Flujo de recaudo</CardTitle>
              <CardDescription>Recaudo real vs esperado — 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={CASH_FLOW} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="recaudo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(222,47%,14%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(222,47%,14%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="esperado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(43,58%,52%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(43,58%,52%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,28%,88%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCOP(v), '']}
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(214,28%,88%)', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="esperado" stroke="hsl(43,58%,52%)" strokeWidth={1.5} fill="url(#esperado)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="recaudo" stroke="hsl(222,47%,14%)" strokeWidth={2} fill="url(#recaudo)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ocupación</CardTitle>
              <CardDescription>Estado actual del portafolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Ocupadas', count: 10, total: 12, color: 'bg-primary' },
                { label: 'Disponibles', count: 1, total: 12, color: 'bg-success' },
                { label: 'En mora', count: 1, total: 12, color: 'bg-destructive' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.count}/{item.total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 rounded-lg bg-[hsl(var(--gold-muted))] p-3">
                <p className="text-xs font-medium text-[hsl(var(--gold))]">Tasa de ocupación</p>
                <p className="text-2xl font-semibold text-foreground">91.7%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Pagos recientes</CardTitle>
                <CardDescription>Últimas transacciones registradas</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/pagos">Ver todos</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Propiedad</th>
                  <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_PAYMENTS.map((p) => {
                  const s = STATUS_BADGE[p.status];
                  return (
                    <tr key={p.id} className="table-row-hover border-b border-border last:border-0">
                      <td className="px-6 py-3 font-medium text-foreground">{p.renter}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{p.property}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCOP(p.amount)}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell">{formatDateShort(p.date)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

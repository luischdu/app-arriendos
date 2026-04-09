'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Building2, Users, CreditCard, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCOP, formatDateShort } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['hsl(222,47%,14%)', 'hsl(43,58%,52%)', 'hsl(142,71%,45%)', 'hsl(0,84%,60%)'];

async function fetchAll() {
  const [props, renters, payments] = await Promise.all([
    fetch('/api/properties').then((r) => r.json()),
    fetch('/api/renters').then((r) => r.json()),
    fetch('/api/payments').then((r) => r.json()),
  ]);
  return { props, renters, payments };
}

export default function ReportesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reportes-data'],
    queryFn: fetchAll,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const props: any[] = data?.props ?? [];
  const renters: any[] = data?.renters ?? [];
  const payments: any[] = data?.payments ?? [];

  // KPIs
  const totalPropiedades = props.length;
  const arrendadas = props.filter((p) => p.status === 'rented').length;
  const disponibles = props.filter((p) => p.status === 'available').length;
  const ocupacion = totalPropiedades > 0 ? Math.round((arrendadas / totalPropiedades) * 100) : 0;
  const totalRecaudado = payments.filter((p) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const totalMora = payments.filter((p) => p.status === 'overdue').reduce((s: number, p: any) => s + (p.amount ?? 0) + (p.lateFee ?? 0), 0);
  const enMora = renters.filter((r) => r.status === 'overdue').length;

  // Distribución por tipo de propiedad
  const typeCount: Record<string, number> = {};
  props.forEach((p) => { typeCount[p.propertyType] = (typeCount[p.propertyType] ?? 0) + 1; });
  const typeData = Object.entries(typeCount).map(([name, value]) => ({
    name: { apartamento: 'Apto', casa: 'Casa', local: 'Local', bodega: 'Bodega', oficina: 'Oficina' }[name] ?? name,
    value,
  }));

  // Estado de pagos
  const paymentStatusData = [
    { name: 'Pagados', value: payments.filter((p) => p.status === 'paid').length },
    { name: 'Pendientes', value: payments.filter((p) => p.status === 'pending').length },
    { name: 'En mora', value: payments.filter((p) => p.status === 'overdue').length },
  ];

  // Canon por propiedad (top 5)
  const canonData = [...props]
    .sort((a, b) => (b.monthlyRent ?? 0) - (a.monthlyRent ?? 0))
    .slice(0, 5)
    .map((p) => ({ name: p.name?.slice(0, 12) ?? '—', canon: p.monthlyRent ?? 0 }));

  // Pagos recientes
  const recentPaid = [...payments]
    .filter((p) => p.status === 'paid')
    .sort((a, b) => new Date(b.paidDate ?? 0).getTime() - new Date(a.paidDate ?? 0).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Reportes" subtitle="Análisis del portafolio" />

      <div className="page-container space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Tasa de ocupación', value: `${ocupacion}%`, sub: `${arrendadas} de ${totalPropiedades} propiedades`, icon: Building2 },
            { label: 'Arrendatarios activos', value: renters.filter((r) => r.status === 'active').length, sub: `${enMora} en mora`, icon: Users },
            { label: 'Total recaudado', value: formatCOP(totalRecaudado), sub: `${payments.filter((p) => p.status === 'paid').length} pagos`, icon: CreditCard },
            { label: 'Cartera en mora', value: formatCOP(totalMora), sub: `${payments.filter((p) => p.status === 'overdue').length} vencidos`, icon: TrendingUp },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{kpi.value}</p>
                  </div>
                  <div className="rounded-lg p-2 bg-muted">
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Canon por propiedad */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top propiedades por canon</CardTitle>
              <CardDescription>Canon mensual (COP)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={canonData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,28%,88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [formatCOP(v), 'Canon']}
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(214,28%,88%)', fontSize: 12 }} />
                  <Bar dataKey="canon" fill="hsl(222,47%,14%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por tipo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Portafolio por tipo</CardTitle>
              <CardDescription>Distribución de inmuebles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {typeData.map((_entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Estado de pagos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Estado de pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentStatusData.map((item, i) => (
                  <div key={item.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${payments.length > 0 ? (item.value / payments.length) * 100 : 0}%`,
                          backgroundColor: COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Ocupación', value: `${ocupacion}%`, color: 'text-primary' },
                  { label: 'Disponibles', value: disponibles, color: 'text-success' },
                  { label: 'Mantenimiento', value: props.filter((p) => p.status === 'maintenance').length, color: 'text-warning' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted p-3">
                    <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Últimos pagos recibidos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Últimos pagos recibidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentPaid.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Sin pagos registrados</div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {recentPaid.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{p.renterName}</p>
                          <p className="text-xs text-muted-foreground">{p.propertyName}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-medium">{formatCOP(p.amount)}</p>
                          <p className="text-xs text-muted-foreground">{p.paidDate ? formatDateShort(p.paidDate) : '—'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, AlertCircle, CheckCircle2, Clock, Loader2, Receipt } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCOP, formatDateShort, daysOverdue } from '@/lib/utils';

type Payment = {
  id: string; contractId: string; renterId: string; propertyId: string;
  renterName: string; propertyName: string;
  dueDate: string; paidDate: string | null; amount: number; lateFee: number;
  status: string; method: string | null; notes: string;
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default'; icon: typeof CheckCircle2 }> = {
  paid: { label: 'Pagado', variant: 'success', icon: CheckCircle2 },
  overdue: { label: 'En mora', variant: 'destructive', icon: AlertCircle },
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  partial: { label: 'Parcial', variant: 'warning', icon: Clock },
};

async function fetchPayments(q: string, status: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status && status !== 'all') params.set('status', status);
  const res = await fetch(`/api/payments?${params}`);
  if (!res.ok) throw new Error('Error');
  return res.json() as Promise<Payment[]>;
}

export default function PagosPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [regForm, setRegForm] = useState({ paidDate: new Date().toISOString().slice(0, 10), method: 'Transferencia', notes: '', lateFee: 0 });
  const qc = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', search, filter],
    queryFn: () => fetchPayments(search, filter),
    staleTime: 30_000,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPayment) return;
      const res = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidDate: regForm.paidDate,
          method: regForm.method,
          notes: regForm.notes,
          lateFee: Number(regForm.lateFee),
        }),
      });
      if (!res.ok) throw new Error('Error al registrar pago');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      setRegisterOpen(false);
      setSelectedPayment(null);
    },
  });

  const totalRecaudado = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalMora = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount + p.lateFee, 0);
  const totalPendiente = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Pagos" subtitle="Gestión de recaudo" />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="stat-card-gold">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recaudado (registros)</p>
              <p className="text-xl font-semibold text-foreground mt-1">{formatCOP(totalRecaudado)}</p>
              <p className="text-xs text-success mt-1">
                {payments.filter((p) => p.status === 'paid').length} pagos confirmados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">En mora</p>
              <p className="text-xl font-semibold text-destructive mt-1">{formatCOP(totalMora)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.filter((p) => p.status === 'overdue').length} pagos vencidos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Por cobrar</p>
              <p className="text-xl font-semibold text-warning mt-1">{formatCOP(totalPendiente)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.filter((p) => p.status === 'pending').length} pagos pendientes
              </p>
            </CardContent>
          </Card>
        </div>

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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Historial de pagos</CardTitle>
              <CardDescription>{payments.length} registros</CardDescription>
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
                  {payments.map((p) => {
                    const s = STATUS_MAP[p.status] ?? { label: p.status, variant: 'default' as const, icon: Clock };
                    const days = p.status === 'overdue' ? daysOverdue(p.dueDate) : 0;
                    return (
                      <tr key={p.id} className="table-row-hover border-b border-border last:border-0">
                        <td className="px-6 py-3 font-medium text-foreground">{p.renterName}</td>
                        <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{p.propertyName}</td>
                        <td className="px-6 py-3 text-right">
                          <p className="font-medium">{formatCOP(p.amount)}</p>
                          {p.lateFee > 0 && (
                            <p className="text-xs text-destructive">+{formatCOP(p.lateFee)} mora</p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                          {formatDateShort(p.dueDate)}
                          {days > 0 && <p className="text-destructive">{days} días vencido</p>}
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {(p.status === 'pending' || p.status === 'overdue') ? (
                            <Button
                              variant="outline" size="sm" className="h-7 text-xs"
                              onClick={() => { setSelectedPayment(p); setRegisterOpen(true); }}
                            >
                              Registrar pago
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                              <a href={`/api/payments/${p.id}/receipt`} target="_blank">
                                <Receipt className="mr-1 h-3 w-3" />Recibo
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">Sin resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Registrar Pago */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-1 py-1">
              <p className="text-sm font-medium">{selectedPayment.renterName}</p>
              <p className="text-xs text-muted-foreground">{selectedPayment.propertyName} · Vence {formatDateShort(selectedPayment.dueDate)}</p>
              <p className="text-sm font-semibold">{formatCOP(selectedPayment.amount)}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Fecha de pago</Label>
              <Input type="date" value={regForm.paidDate} onChange={(e) => setRegForm((f) => ({ ...f, paidDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Método</Label>
              <Select value={regForm.method} onValueChange={(v) => setRegForm((f) => ({ ...f, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="PSE">PSE</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Nequi">Nequi</SelectItem>
                  <SelectItem value="Daviplata">Daviplata</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mora adicional (COP)</Label>
              <Input type="number" min={0} value={regForm.lateFee} onChange={(e) => setRegForm((f) => ({ ...f, lateFee: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Observaciones</Label>
              <Textarea value={regForm.notes} onChange={(e) => setRegForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancelar</Button>
            <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}>
              {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

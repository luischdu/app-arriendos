'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, Pencil, Loader2, Users, FileText, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials, formatCOP, formatDateShort } from '@/lib/utils';

type Renter = Record<string, any>;

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  active: { label: 'Activo', variant: 'success' },
  overdue: { label: 'En mora', variant: 'destructive' },
  pending: { label: 'Por iniciar', variant: 'warning' },
  inactive: { label: 'Inactivo', variant: 'default' },
};

export default function ArrendatarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Renter>({});

  const { data: renter, isLoading } = useQuery({
    queryKey: ['renter', id],
    queryFn: async () => {
      const res = await fetch(`/api/renters/${id}`);
      if (!res.ok) throw new Error('No encontrado');
      return res.json();
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-by-renter', id],
    queryFn: async () => {
      const res = await fetch('/api/contracts');
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((c: any) => c.renterId === id);
    },
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-by-renter', id],
    queryFn: async () => {
      const res = await fetch('/api/payments');
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((p: any) => p.renterId === id);
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Renter) => {
      const res = await fetch(`/api/renters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['renter', id] });
      qc.invalidateQueries({ queryKey: ['renters'] });
      setEditOpen(false);
    },
  });

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!renter) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Users className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Arrendatario no encontrado</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arrendatarios')}>Volver</Button>
      </div>
    );
  }

  const s = STATUS_MAP[renter.status] ?? { label: renter.status, variant: 'default' as const };
  const totalPagado = payments.filter((p: any) => p.status === 'paid').reduce((acc: number, p: any) => acc + (p.amount ?? 0), 0);

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title={renter.fullName}
        subtitle={`CC ${renter.cedula}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/arrendatarios')}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />Volver
            </Button>
            <Button size="sm" onClick={() => { setForm(renter); setEditOpen(true); }}>
              <Pencil className="mr-1.5 h-4 w-4" />Editar
            </Button>
          </div>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Información personal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">{getInitials(renter.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{renter.fullName}</p>
                  <Badge variant={s.variant} className="mt-1">{s.label}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Cédula</p>
                  <p className="font-medium mt-1">{renter.cedula}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Teléfono</p>
                  <p className="font-medium mt-1">{renter.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />Email</p>
                  <p className="font-medium mt-1">{renter.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Arrendatario desde</p>
                  <p className="font-medium mt-1">{formatDateShort(renter.since)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Contratos</p>
                <p className="text-2xl font-semibold mt-1">{contracts.length}</p>
              </CardContent>
            </Card>
            <Card className="stat-card-gold">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Total pagado</p>
                <p className="text-xl font-semibold mt-1">{formatCOP(totalPagado)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {contracts.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Contratos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Código</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Propiedad</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Vigencia</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Canon</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c: any) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{c.code}</td>
                      <td className="px-6 py-3 font-medium">{c.propertyName}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{formatDateShort(c.startDate)} → {formatDateShort(c.endDate)}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCOP(c.monthlyRent)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={c.status === 'active' ? 'success' : c.status === 'terminated' ? 'secondary' : 'warning'}>
                          {c.status === 'active' ? 'Vigente' : c.status === 'terminated' ? 'Terminado' : 'Por iniciar'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {payments.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" />Historial de pagos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Propiedad</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Vencimiento</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Valor</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 text-muted-foreground">{p.propertyName}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{formatDateShort(p.dueDate)}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCOP(p.amount)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'destructive' : 'warning'}>
                          {{ paid: 'Pagado', overdue: 'En mora', pending: 'Pendiente' }[p.status as string] ?? p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {p.status === 'paid' && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <a href={`/api/payments/${p.id}/receipt`} target="_blank">Recibo</a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar arrendatario</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Nombre completo</Label>
              <Input value={form.fullName ?? ''} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Cédula</Label>
              <Input value={form.cedula ?? ''} onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Por iniciar</SelectItem>
                  <SelectItem value="overdue">En mora</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, CalendarDays, TrendingUp, Loader2, Printer } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatCOP, formatDateShort } from '@/lib/utils';

type Contract = {
  id: string; code: string; renterId: string; propertyId: string;
  renterName: string; propertyName: string;
  startDate: string; endDate: string; monthlyRent: number; deposit: number;
  incrementPct: number; paymentDay: number; status: string;
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' | 'secondary' }> = {
  active: { label: 'Vigente', variant: 'success' },
  pending: { label: 'Por iniciar', variant: 'warning' },
  terminated: { label: 'Terminado', variant: 'secondary' },
  expired: { label: 'Vencido', variant: 'destructive' },
};

const EMPTY = {
  renterName: '', propertyName: '', renterId: '', propertyId: '',
  startDate: '', endDate: '', monthlyRent: 0, deposit: 0,
  incrementPct: 5, paymentDay: 5, status: 'active',
};

async function fetchContracts(q: string) {
  const res = await fetch(`/api/contracts${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!res.ok) throw new Error('Error al cargar contratos');
  return res.json() as Promise<Contract[]>;
}

async function fetchRenters() {
  const res = await fetch('/api/renters');
  if (!res.ok) return [];
  return res.json();
}

async function fetchProperties() {
  const res = await fetch('/api/properties');
  if (!res.ok) return [];
  return res.json();
}

export default function ContratosPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', search],
    queryFn: () => fetchContracts(search),
    staleTime: 30_000,
  });

  const { data: renters = [] } = useQuery({
    queryKey: ['renters-select'],
    queryFn: fetchRenters,
    enabled: open,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-select'],
    queryFn: fetchProperties,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof EMPTY) => {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear contrato');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      setOpen(false);
      setForm(EMPTY);
    },
  });

  const active = contracts.filter((c) => c.status === 'active');

  const handleRenterChange = (renterId: string) => {
    const r = (renters as any[]).find((x: any) => x.id === renterId);
    setForm((f) => ({ ...f, renterId, renterName: r?.fullName ?? '' }));
  };

  const handlePropertyChange = (propertyId: string) => {
    const p = (properties as any[]).find((x: any) => x.id === propertyId);
    setForm((f) => ({
      ...f, propertyId,
      propertyName: p?.name ?? '',
      monthlyRent: p?.monthlyRent ?? f.monthlyRent,
      deposit: p?.monthlyRent ? p.monthlyRent * 2 : f.deposit,
    }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Contratos"
        subtitle={`${active.length} contratos vigentes`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo contrato
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Vigentes', value: contracts.filter((c) => c.status === 'active').length },
            { label: 'Por iniciar', value: contracts.filter((c) => c.status === 'pending').length },
            { label: 'Terminados', value: contracts.filter((c) => c.status === 'terminated').length },
            { label: 'Canon total', value: formatCOP(active.reduce((s, c) => s + c.monthlyRent, 0)) },
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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Contratos de arrendamiento</CardTitle>
              <CardDescription>{contracts.length} resultados</CardDescription>
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
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Imprimir</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => {
                    const s = STATUS_MAP[c.status] ?? { label: c.status, variant: 'default' as const };
                    return (
                      <tr key={c.id} className="table-row-hover border-b border-border last:border-0">
                        <td className="px-6 py-3">
                          <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                        </td>
                        <td className="px-6 py-3 font-medium text-foreground">{c.renterName}</td>
                        <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{c.propertyName}</td>
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
                        <td className="px-6 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <a href={`/api/contracts/${c.id}/print`} target="_blank">
                              <Printer className="mr-1 h-3 w-3" />Contrato
                            </a>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {contracts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">Sin contratos</p>
                  <p className="text-xs text-muted-foreground mt-1">Crea un nuevo contrato con el botón superior</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Nuevo Contrato */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo contrato de arrendamiento</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Arrendatario</Label>
              <Select onValueChange={handleRenterChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {(renters as any[]).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Propiedad</Label>
              <Select onValueChange={handlePropertyChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {(properties as any[]).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha inicio</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Fecha fin</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Canon mensual (COP)</Label>
              <Input type="number" value={form.monthlyRent} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Depósito (COP)</Label>
              <Input type="number" value={form.deposit} onChange={(e) => setForm((f) => ({ ...f, deposit: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>% Incremento anual</Label>
              <Input type="number" min={0} max={100} value={form.incrementPct} onChange={(e) => setForm((f) => ({ ...f, incrementPct: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Día de pago</Label>
              <Input type="number" min={1} max={28} value={form.paymentDay} onChange={(e) => setForm((f) => ({ ...f, paymentDay: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Vigente</SelectItem>
                  <SelectItem value="pending">Por iniciar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !form.renterName || !form.propertyName || !form.startDate}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Users, Plus, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getInitials, formatDateShort } from '@/lib/utils';

type Renter = {
  id: string; fullName: string; cedula: string; email: string; phone: string;
  status: string; since: string;
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  active: { label: 'Activo', variant: 'success' },
  overdue: { label: 'En mora', variant: 'destructive' },
  pending: { label: 'Por iniciar', variant: 'warning' },
  inactive: { label: 'Inactivo', variant: 'default' },
};

const EMPTY = { fullName: '', cedula: '', email: '', phone: '', status: 'active', since: new Date().toISOString().slice(0, 10) };

async function fetchRenters(q: string) {
  const res = await fetch(`/api/renters${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!res.ok) throw new Error('Error al cargar arrendatarios');
  return res.json() as Promise<Renter[]>;
}

export default function ArrendatariosPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: renters = [], isLoading } = useQuery({
    queryKey: ['renters', search],
    queryFn: () => fetchRenters(search),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof EMPTY) => {
      const res = await fetch('/api/renters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear arrendatario');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['renters'] });
      setOpen(false);
      setForm(EMPTY);
    },
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Arrendatarios"
        subtitle={`${renters.length} inquilinos registrados`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo arrendatario
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: renters.length },
            { label: 'Al día', value: renters.filter((r) => r.status === 'active').length },
            { label: 'En mora', value: renters.filter((r) => r.status === 'overdue').length },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, cédula o email..."
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
              <CardTitle className="text-sm font-semibold">Listado de arrendatarios</CardTitle>
              <CardDescription>{renters.length} resultados</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Contacto</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Desde</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {renters.map((r) => {
                    const s = STATUS_MAP[r.status] ?? { label: r.status, variant: 'default' as const };
                    return (
                      <tr key={r.id} className="table-row-hover border-b border-border last:border-0">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(r.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{r.fullName}</p>
                              <p className="text-xs text-muted-foreground">CC {r.cedula}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {r.phone}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {r.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                          {formatDateShort(r.since)}
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            variant="ghost" size="sm" className="h-7 text-xs"
                            onClick={() => router.push(`/dashboard/arrendatarios/${r.id}`)}
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {renters.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">Sin resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Nuevo Arrendatario */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo arrendatario</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Nombre completo</Label>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Carlos Mendoza" />
            </div>
            <div className="space-y-1">
              <Label>Cédula</Label>
              <Input value={form.cedula} onChange={(e) => set('cedula', e.target.value)} placeholder="1023456789" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="3001234567" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Por iniciar</SelectItem>
                  <SelectItem value="overdue">En mora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha desde</Label>
              <Input type="date" value={form.since} onChange={(e) => set('since', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.fullName}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

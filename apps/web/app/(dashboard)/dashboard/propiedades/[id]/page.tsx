'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, BedDouble, Bath, Car, Pencil, Loader2,
  Building2, FileText, CreditCard,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useState } from 'react';

type Property = Record<string, any>;

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  rented: { label: 'Arrendada', variant: 'default' },
  available: { label: 'Disponible', variant: 'success' },
  maintenance: { label: 'Mantenimiento', variant: 'warning' },
};

export default function PropiedadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Property>({});

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error('No encontrado');
      return res.json();
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-by-property', id],
    queryFn: async () => {
      const res = await fetch('/api/contracts');
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((c: any) => c.propertyId === id);
    },
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-by-property', id],
    queryFn: async () => {
      const res = await fetch('/api/payments');
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((p: any) => p.propertyId === id);
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Property) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', id] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      setEditOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Building2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Propiedad no encontrada</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/propiedades')}>
          Volver
        </Button>
      </div>
    );
  }

  const s = STATUS_MAP[property.status] ?? { label: property.status, variant: 'default' as const };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title={property.name}
        subtitle={property.code}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/propiedades')}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver
            </Button>
            <Button size="sm" onClick={() => { setForm(property); setEditOpen(true); }}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Info principal */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Información del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge variant={s.variant} className="mt-1">{s.label}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium mt-1 capitalize">{property.propertyType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Dirección</p>
                <p className="font-medium mt-1">{property.address}</p>
                <p className="text-muted-foreground text-xs">{property.city}, {property.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estrato</p>
                <p className="font-medium mt-1">{property.stratum || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Área</p>
                <p className="font-medium mt-1">{property.areaSqm ? `${property.areaSqm} m²` : '—'}</p>
              </div>
              {property.rooms > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><BedDouble className="h-3 w-3" />Habitaciones</p>
                  <p className="font-medium mt-1">{property.rooms}</p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Bath className="h-3 w-3" />Baños</p>
                  <p className="font-medium mt-1">{property.bathrooms}</p>
                </div>
              )}
              {property.parkingSpots > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Car className="h-3 w-3" />Parqueaderos</p>
                  <p className="font-medium mt-1">{property.parkingSpots}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canon */}
          <div className="space-y-4">
            <Card className="stat-card-gold">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Canon mensual</p>
                <p className="text-2xl font-semibold mt-1">{formatCOP(property.monthlyRent)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Contratos activos</p>
                <p className="text-2xl font-semibold mt-1">{contracts.filter((c: any) => c.status === 'active').length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contratos */}
        {contracts.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Contratos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Código</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Vigencia</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c: any) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{c.code}</td>
                      <td className="px-6 py-3 font-medium">{c.renterName}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {formatDateShort(c.startDate)} → {formatDateShort(c.endDate)}
                      </td>
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

        {/* Pagos recientes */}
        {payments.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" />Últimos pagos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Vencimiento</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Valor</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((p: any) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 text-xs text-muted-foreground">{formatDateShort(p.dueDate)}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCOP(p.amount)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'destructive' : 'warning'}>
                          {{ paid: 'Pagado', overdue: 'En mora', pending: 'Pendiente' }[p.status as string] ?? p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar propiedad</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Código</Label>
              <Input value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="rented">Arrendada</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Canon mensual (COP)</Label>
              <Input type="number" value={form.monthlyRent ?? 0} onChange={(e) => setForm((f) => ({ ...f, monthlyRent: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Dirección</Label>
              <Input value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Ciudad</Label>
              <Input value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Departamento</Label>
              <Input value={form.department ?? ''} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
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

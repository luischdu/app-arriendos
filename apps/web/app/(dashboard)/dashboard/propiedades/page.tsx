'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Building2, Plus, MapPin, BedDouble, Bath, Car, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatCOP } from '@/lib/utils';

type Property = {
  id: string; code: string; name: string; propertyType: string;
  address: string; city: string; department: string; stratum: number;
  areaSqm: number; rooms: number; bathrooms: number; parkingSpots: number;
  status: string; monthlyRent: number;
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  rented: { label: 'Arrendada', variant: 'default' },
  available: { label: 'Disponible', variant: 'success' },
  maintenance: { label: 'Mantenimiento', variant: 'warning' },
};

const TYPE_ICON: Record<string, string> = {
  apartamento: 'Apto', casa: 'Casa', local: 'Local', bodega: 'Bodega', oficina: 'Oficina',
};

async function fetchProperties(q: string) {
  const res = await fetch(`/api/properties${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!res.ok) throw new Error('Error al cargar propiedades');
  return res.json() as Promise<Property[]>;
}

async function createProperty(data: Partial<Property>) {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear propiedad');
  return res.json();
}

const EMPTY: Partial<Property> = {
  name: '', code: '', propertyType: 'apartamento', address: '', city: '', department: '',
  stratum: 3, areaSqm: 0, rooms: 0, bathrooms: 1, parkingSpots: 0,
  status: 'available', monthlyRent: 0,
};

export default function PropiedadesPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Property>>(EMPTY);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', search],
    queryFn: () => fetchProperties(search),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      setOpen(false);
      setForm(EMPTY);
    },
  });

  const set = (k: keyof Property, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Propiedades"
        subtitle={`${properties.length} inmuebles registrados`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva propiedad
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: properties.length, color: 'text-foreground' },
            { label: 'Arrendadas', value: properties.filter((p) => p.status === 'rented').length, color: 'text-primary' },
            { label: 'Disponibles', value: properties.filter((p) => p.status === 'available').length, color: 'text-success' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, código o ciudad..."
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
              const s = STATUS_MAP[p.status] ?? { label: p.status, variant: 'default' as const };
              return (
                <Card
                  key={p.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/propiedades/${p.id}`)}
                >
                  <CardContent className="p-0">
                    <div className={`h-1 rounded-t-lg ${p.status === 'rented' ? 'bg-primary' : p.status === 'available' ? 'bg-success' : 'bg-warning'}`} />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{p.code}</p>
                          <p className="font-semibold text-foreground">{p.name}</p>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
                          {TYPE_ICON[p.propertyType] ?? p.propertyType}
                        </span>
                        {p.areaSqm > 0 && <span>{p.areaSqm} m²</span>}
                        {p.rooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" />{p.rooms}</span>}
                        {p.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{p.bathrooms}</span>}
                        {p.parkingSpots > 0 && <span className="flex items-center gap-0.5"><Car className="h-3 w-3" />{p.parkingSpots}</span>}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">Canon mensual</span>
                        <span className="text-sm font-semibold text-foreground">{formatCOP(p.monthlyRent)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Sin resultados</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Propiedad */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva propiedad</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Apto 301 Laureles" />
            </div>
            <div className="space-y-1">
              <Label>Código</Label>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="AP-301" />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.propertyType} onValueChange={(v) => set('propertyType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="local">Local comercial</SelectItem>
                  <SelectItem value="bodega">Bodega</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="rented">Arrendada</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Cra 70 #45-20, Apto 301" />
            </div>
            <div className="space-y-1">
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Medellín" />
            </div>
            <div className="space-y-1">
              <Label>Departamento</Label>
              <Input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Antioquia" />
            </div>
            <div className="space-y-1">
              <Label>Estrato</Label>
              <Input type="number" min={0} max={6} value={form.stratum} onChange={(e) => set('stratum', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Área (m²)</Label>
              <Input type="number" min={0} value={form.areaSqm} onChange={(e) => set('areaSqm', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Habitaciones</Label>
              <Input type="number" min={0} value={form.rooms} onChange={(e) => set('rooms', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Baños</Label>
              <Input type="number" min={0} value={form.bathrooms} onChange={(e) => set('bathrooms', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Parqueaderos</Label>
              <Input type="number" min={0} value={form.parkingSpots} onChange={(e) => set('parkingSpots', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>Canon mensual (COP)</Label>
              <Input type="number" min={0} value={form.monthlyRent} onChange={(e) => set('monthlyRent', Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !form.name || !form.address}
            >
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar propiedad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

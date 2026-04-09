'use client';

import { useState } from 'react';
import { Building2, Plus, MapPin, BedDouble, Bath, Car } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCOP } from '@/lib/utils';

const PROPERTIES = [
  {
    id: '1', code: 'AP-301', name: 'Apto 301', propertyType: 'apartamento',
    address: 'Cra 70 #45-20, Apto 301', city: 'Medellín', department: 'Antioquia',
    stratum: 4, areaSqm: 72, rooms: 3, bathrooms: 2, parkingSpots: 1,
    status: 'rented', monthlyRent: 1200000,
  },
  {
    id: '2', code: 'CS-001', name: 'Casa El Poblado', propertyType: 'casa',
    address: 'Cll 10 #34-15', city: 'Medellín', department: 'Antioquia',
    stratum: 6, areaSqm: 180, rooms: 4, bathrooms: 3, parkingSpots: 2,
    status: 'rented', monthlyRent: 2500000,
  },
  {
    id: '3', code: 'LC-105', name: 'Local 105 Centro', propertyType: 'local',
    address: 'Av. El Dorado #22-10', city: 'Bogotá', department: 'Cundinamarca',
    stratum: 0, areaSqm: 45, rooms: 0, bathrooms: 1, parkingSpots: 0,
    status: 'rented', monthlyRent: 1800000,
  },
  {
    id: '4', code: 'AP-202', name: 'Apto 202 Envigado', propertyType: 'apartamento',
    address: 'Cra 43A #34-60', city: 'Envigado', department: 'Antioquia',
    stratum: 3, areaSqm: 58, rooms: 2, bathrooms: 1, parkingSpots: 1,
    status: 'rented', monthlyRent: 950000,
  },
  {
    id: '5', code: 'AP-503', name: 'Apto 503 Laureles', propertyType: 'apartamento',
    address: 'Cll 76 #80-12, Apto 503', city: 'Medellín', department: 'Antioquia',
    stratum: 4, areaSqm: 65, rooms: 2, bathrooms: 2, parkingSpots: 1,
    status: 'available', monthlyRent: 1100000,
  },
  {
    id: '6', code: 'BD-001', name: 'Bodega Guayabal', propertyType: 'bodega',
    address: 'Cra 52 #10-30', city: 'Medellín', department: 'Antioquia',
    stratum: 0, areaSqm: 250, rooms: 0, bathrooms: 1, parkingSpots: 4,
    status: 'maintenance', monthlyRent: 3200000,
  },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  rented: { label: 'Arrendada', variant: 'default' },
  available: { label: 'Disponible', variant: 'success' },
  maintenance: { label: 'Mantenimiento', variant: 'warning' },
};

const TYPE_ICON: Record<string, string> = {
  apartamento: 'Apto',
  casa: 'Casa',
  local: 'Local',
  bodega: 'Bodega',
  oficina: 'Oficina',
};

export default function PropiedadesPage() {
  const [search, setSearch] = useState('');

  const filtered = PROPERTIES.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Propiedades"
        subtitle={`${PROPERTIES.length} inmuebles registrados`}
        action={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva propiedad
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: PROPERTIES.length, color: 'text-foreground' },
            { label: 'Arrendadas', value: PROPERTIES.filter((p) => p.status === 'rented').length, color: 'text-primary' },
            { label: 'Disponibles', value: PROPERTIES.filter((p) => p.status === 'available').length, color: 'text-success' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtro */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, código o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const s = STATUS_MAP[p.status];
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {/* Color strip */}
                  <div
                    className={`h-1 rounded-t-lg ${p.status === 'rented' ? 'bg-primary' : p.status === 'available' ? 'bg-success' : 'bg-warning'}`}
                  />
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
                      {p.areaSqm && <span>{p.areaSqm} m²</span>}
                      {p.rooms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <BedDouble className="h-3 w-3" />
                          {p.rooms}
                        </span>
                      )}
                      {p.bathrooms > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Bath className="h-3 w-3" />
                          {p.bathrooms}
                        </span>
                      )}
                      {p.parkingSpots > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Car className="h-3 w-3" />
                          {p.parkingSpots}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">Canon mensual</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCOP(p.monthlyRent)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Sin resultados</p>
            <p className="text-xs text-muted-foreground mt-1">
              No se encontraron propiedades con ese criterio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

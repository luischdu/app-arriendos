'use client';

import { useState } from 'react';
import { Users, Plus, Phone, Mail, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatDateShort } from '@/lib/utils';

const RENTERS = [
  {
    id: '1', fullName: 'Carlos Mendoza', cedula: '1.023.456.789',
    email: 'carlos.mendoza@email.com', phone: '3001234567',
    property: 'Apto 301 - Laureles', monthlyRent: 1200000,
    status: 'active', since: '2024-02-01',
  },
  {
    id: '2', fullName: 'Ana García', cedula: '43.876.543',
    email: 'ana.garcia@email.com', phone: '3157654321',
    property: 'Casa El Poblado', monthlyRent: 2500000,
    status: 'active', since: '2023-09-15',
  },
  {
    id: '3', fullName: 'Pedro Ramírez', cedula: '71.234.567',
    email: 'pedro.ramirez@email.com', phone: '3143218765',
    property: 'Local 105 - Centro', monthlyRent: 1800000,
    status: 'overdue', since: '2024-01-01',
  },
  {
    id: '4', fullName: 'Sofía Torres', cedula: '1.152.345.678',
    email: 'sofia.torres@email.com', phone: '3209876543',
    property: 'Apto 202 - Envigado', monthlyRent: 950000,
    status: 'active', since: '2024-06-01',
  },
  {
    id: '5', fullName: 'Miguel Herrera', cedula: '98.765.432',
    email: 'miguel.herrera@email.com', phone: '3112345678',
    property: 'Apto 503 - Laureles', monthlyRent: 1100000,
    status: 'pending', since: '2026-03-01',
  },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'default' }> = {
  active: { label: 'Activo', variant: 'success' },
  overdue: { label: 'En mora', variant: 'destructive' },
  pending: { label: 'Por iniciar', variant: 'warning' },
};

export default function ArrendatariosPage() {
  const [search, setSearch] = useState('');

  const filtered = RENTERS.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.cedula.replace(/\./g, '').includes(search.replace(/\./g, '')),
  );

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Arrendatarios"
        subtitle={`${RENTERS.length} inquilinos registrados`}
        action={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo arrendatario
          </Button>
        }
      />

      <div className="page-container space-y-5 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: RENTERS.length },
            { label: 'Al día', value: RENTERS.filter((r) => r.status === 'active').length },
            { label: 'En mora', value: RENTERS.filter((r) => r.status === 'overdue').length },
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Listado de arrendatarios</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Arrendatario</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Propiedad</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Contacto</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Desde</th>
                  <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                  <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const s = STATUS_MAP[r.status];
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
                      <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{r.property}</td>
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
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <FileText className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">Sin resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

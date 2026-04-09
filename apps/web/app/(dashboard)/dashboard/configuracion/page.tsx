'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Users, Plus, Trash2, Loader2, Shield, User, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials, formatDateShort } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';

type AppUser = {
  id: string; fullName: string; email: string; role: string;
  tenantName: string; status: string; createdAt: string;
};

const ROLE_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning'; icon: typeof Shield }> = {
  admin: { label: 'Administrador', variant: 'default', icon: Shield },
  manager: { label: 'Gestor', variant: 'success', icon: User },
  viewer: { label: 'Consultor', variant: 'secondary', icon: Eye },
};

const EMPTY_USER = { fullName: '', email: '', role: 'manager', tenantName: 'Inmobiliaria Demo SAS' };

export default function ConfiguracionPage() {
  const { user: currentUser } = useAuthStore();
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_USER);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['app-users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Error');
      return res.json() as Promise<AppUser[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof EMPTY_USER) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Error al crear usuario');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-users'] });
      setNewUserOpen(false);
      setForm(EMPTY_USER);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Error al eliminar');
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-users'] });
      setDeleteId(null);
    },
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Configuración"
        subtitle="Gestión de cuenta y usuarios"
      />

      <div className="page-container space-y-6 animate-fade-in">
        {/* Info de cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Información de la cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium mt-1">{currentUser?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium mt-1">{currentUser?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Empresa / Inmobiliaria</p>
              <p className="font-medium mt-1">{currentUser?.tenantName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="font-medium mt-1 capitalize">{currentUser?.role ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios del sistema
              </CardTitle>
              <CardDescription>Administra los accesos al portal</CardDescription>
            </div>
            <Button size="sm" onClick={() => setNewUserOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo usuario
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Usuario</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Rol</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Estado</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = ROLE_MAP[u.role] ?? { label: u.role, variant: 'default' as const, icon: User };
                    const isSelf = u.email === currentUser?.email;
                    return (
                      <tr key={u.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(u.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{u.fullName}
                                {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDateShort(u.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                        <td className="px-6 py-3">
                          <Badge variant={role.variant}>{role.label}</Badge>
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell">
                          <Badge variant={u.status === 'active' ? 'success' : 'secondary'}>
                            {u.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {!isSelf && (
                              <>
                                <Button
                                  variant="ghost" size="sm" className="h-7 text-xs"
                                  onClick={() => toggleMutation.mutate({ id: u.id, status: u.status === 'active' ? 'inactive' : 'active' })}
                                >
                                  {u.status === 'active' ? 'Desactivar' : 'Activar'}
                                </Button>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(u.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Roles y permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Roles y permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: 'Administrador', desc: 'Acceso completo: propiedades, arrendatarios, contratos, pagos, usuarios y configuración.' },
                { role: 'Gestor', desc: 'Puede crear y editar propiedades, arrendatarios, contratos y registrar pagos. No puede gestionar usuarios.' },
                { role: 'Consultor', desc: 'Solo lectura. Puede ver toda la información pero no puede modificar nada.' },
              ].map((r) => (
                <div key={r.role} className="flex gap-3 text-sm">
                  <span className="font-semibold w-28 shrink-0">{r.role}</span>
                  <span className="text-muted-foreground">{r.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Nuevo Usuario */}
      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo usuario</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre completo</Label>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Ana Pérez" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ana@empresa.com" />
            </div>
            <div className="space-y-1">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => set('role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="viewer">Consultor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-destructive">{(createMutation.error as Error).message}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUserOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.fullName || !form.email}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar usuario</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
          {deleteMutation.isError && (
            <p className="text-xs text-destructive">{(deleteMutation.error as Error).message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/propiedades', label: 'Propiedades', icon: Building2 },
  { href: '/dashboard/arrendatarios', label: 'Arrendatarios', icon: Users },
  { href: '/dashboard/contratos', label: 'Contratos', icon: FileText },
  { href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">Arriendos</span>
          <span className="text-sm font-semibold text-[hsl(var(--gold))]">PRO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Configuración
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {user ? getInitials(user.fullName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {user?.fullName ?? 'Usuario'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.tenantName ?? ''}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

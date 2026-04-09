export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { hashPassword } from '@/lib/auth-utils';

/**
 * GET /api/auth/seed
 * Inicializa el usuario admin si no existe ningún usuario.
 * Solo funciona cuando la base de usuarios está vacía.
 */
export async function GET() {
  const users = await readStore<Record<string, any>>('auth_users');

  if (users.length > 0) {
    return NextResponse.json({
      message: 'Ya existen usuarios registrados. Usa el login.',
      count: users.length,
    });
  }

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin123!';

  const adminUser = {
    id: 'usr-admin-001',
    fullName: 'Administrador',
    email: 'admin@arriendospro.com',
    role: 'admin',
    tenantId: 'tenant-001',
    tenantName: 'ArriendosPRO',
    status: 'active',
    passwordHash: hashPassword(adminPassword),
    createdAt: new Date().toISOString(),
  };

  await writeStore('auth_users', [adminUser]);

  return NextResponse.json({
    message: 'Admin creado exitosamente',
    email: adminUser.email,
    password: adminPassword,
    note: 'Cambia la contraseña después del primer inicio de sesión.',
  });
}

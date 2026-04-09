import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth-utils';

const INITIAL_ADMIN = {
  id: 'usr-admin-001',
  fullName: 'Administrador',
  email: 'admin@arriendospro.com',
  role: 'admin' as const,
  tenantId: 'tenant-001',
  tenantName: 'ArriendosPRO',
  status: 'active',
  createdAt: new Date().toISOString(),
};

async function getAuthUsers() {
  let users = await readStore<Record<string, any>>('auth_users');
  if (users.length === 0) {
    // Crear admin inicial con contraseña por defecto
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin123!';
    const seedUser = {
      ...INITIAL_ADMIN,
      passwordHash: hashPassword(adminPassword),
    };
    await writeStore('auth_users', [seedUser]);
    users = [seedUser];
  }
  return users;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ message: 'Credenciales requeridas' }, { status: 400 });
  }

  const users = await getAuthUsers();
  const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }

  if (user.status === 'inactive') {
    return NextResponse.json({ message: 'Usuario inactivo. Contacta al administrador.' }, { status: 403 });
  }

  if (!verifyPassword(password, user.passwordHash ?? '')) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }

  const { passwordHash: _ph, ...safeUser } = user;
  const accessToken = signToken(user.id, user.role);

  const res = NextResponse.json({ accessToken, user: safeUser });
  res.cookies.set('access_token', accessToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
  });
  return res;
}

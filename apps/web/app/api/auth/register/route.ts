export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { hashPassword, signToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { fullName, email, password, phone, companyName } = body as {
    fullName?: string; email?: string; password?: string;
    phone?: string; companyName?: string;
  };

  if (!fullName || !email || !password) {
    return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
  }

  const users = await readStore<Record<string, any>>('auth_users');

  if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ message: 'El email ya está registrado' }, { status: 400 });
  }

  const newUser = {
    id: newId(),
    fullName,
    email,
    phone: phone ?? '',
    role: users.length === 0 ? 'admin' : 'manager',
    tenantId: `tenant-${newId()}`,
    tenantName: companyName ?? fullName,
    status: 'active',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeStore('auth_users', users);

  const { passwordHash: _ph, ...safeUser } = newUser;
  const accessToken = signToken(newUser.id, newUser.role);

  const res = NextResponse.json({ accessToken, user: safeUser }, { status: 201 });
  res.cookies.set('access_token', accessToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
  });
  return res;
}

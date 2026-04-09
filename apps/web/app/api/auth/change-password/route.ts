import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readStore, writeStore } from '@/lib/store';
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ message: 'Token inválido' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: 'Contraseña actual y nueva son requeridas' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 });
  }

  const users = await readStore<Record<string, any>>('auth_users');
  const idx = users.findIndex((u: any) => u.id === payload.sub);
  if (idx === -1) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

  if (!verifyPassword(currentPassword, users[idx].passwordHash ?? '')) {
    return NextResponse.json({ message: 'Contraseña actual incorrecta' }, { status: 400 });
  }

  users[idx] = { ...users[idx], passwordHash: hashPassword(newPassword) };
  await writeStore('auth_users', users);
  return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
}

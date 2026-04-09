export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readStore } from '@/lib/store';
import { verifyToken } from '@/lib/auth-utils';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }

  const users = await readStore<Record<string, any>>('auth_users');
  const user = users.find((u: any) => u.id === payload.sub);

  if (!user || user.status === 'inactive') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { passwordHash: _ph, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

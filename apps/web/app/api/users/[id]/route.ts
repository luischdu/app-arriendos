import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  // No permitir cambiar passwordHash desde aquí
  delete body.passwordHash;

  const data = await readStore<Record<string, any>>('auth_users');
  const idx = data.findIndex((u: any) => u.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('auth_users', data);

  const { passwordHash: _ph, ...safeUser } = data[idx];
  return NextResponse.json(safeUser);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const data = await readStore<Record<string, any>>('auth_users');
  const user = data.find((u: any) => u.id === params.id);
  if (!user) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

  if (user.role === 'admin') {
    const admins = data.filter((u: any) => u.role === 'admin');
    if (admins.length <= 1) {
      return NextResponse.json({ message: 'No se puede eliminar el único administrador' }, { status: 400 });
    }
  }

  const filtered = data.filter((u: any) => u.id !== params.id);
  await writeStore('auth_users', filtered);
  return NextResponse.json({ success: true });
}

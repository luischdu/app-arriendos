import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = await readStore<Record<string, unknown>>('users');
  const idx = data.findIndex((u: any) => u.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('users', data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const data = await readStore<Record<string, unknown>>('users');
  const user = data.find((u: any) => u.id === params.id);
  if (!user) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  if ((user as any).role === 'admin') {
    const admins = data.filter((u: any) => u.role === 'admin');
    if (admins.length <= 1) {
      return NextResponse.json({ message: 'No se puede eliminar el único administrador' }, { status: 400 });
    }
  }
  const filtered = data.filter((u: any) => u.id !== params.id);
  await writeStore('users', filtered);
  return NextResponse.json({ success: true });
}

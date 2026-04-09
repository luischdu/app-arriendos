export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const data = await readStore<Record<string, unknown>>('contracts');
  const idx = data.findIndex((c: any) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], status: 'terminated', terminatedAt: new Date().toISOString() };
  await writeStore('contracts', data);
  return NextResponse.json(data[idx]);
}

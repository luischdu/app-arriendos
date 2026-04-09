export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { SEED_RENTERS } from '@/lib/seed-data';

async function getRenters() {
  let data = await readStore<Record<string, unknown>>('renters');
  if (data.length === 0) {
    await writeStore('renters', SEED_RENTERS);
    data = SEED_RENTERS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getRenters();
  const item = data.find((r: any) => r.id === params.id);
  if (!item) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = await getRenters();
  const idx = data.findIndex((r: any) => r.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('renters', data);
  return NextResponse.json(data[idx]);
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { SEED_PROPERTIES } from '@/lib/seed-data';

async function getProperties() {
  let data = await readStore<Record<string, unknown>>('properties');
  if (data.length === 0) {
    await writeStore('properties', SEED_PROPERTIES);
    data = SEED_PROPERTIES as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getProperties();
  const item = data.find((p: any) => p.id === params.id);
  if (!item) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = await getProperties();
  const idx = data.findIndex((p: any) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('properties', data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const data = await getProperties();
  const filtered = data.filter((p: any) => p.id !== params.id);
  if (filtered.length === data.length)
    return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  await writeStore('properties', filtered);
  return NextResponse.json({ success: true });
}

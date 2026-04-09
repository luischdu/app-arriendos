import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { SEED_CONTRACTS } from '@/lib/seed-data';

async function getContracts() {
  let data = await readStore<Record<string, unknown>>('contracts');
  if (data.length === 0) {
    await writeStore('contracts', SEED_CONTRACTS);
    data = SEED_CONTRACTS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getContracts();
  const item = data.find((c: any) => c.id === params.id);
  if (!item) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = await getContracts();
  const idx = data.findIndex((c: any) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('contracts', data);
  return NextResponse.json(data[idx]);
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';
import { SEED_PAYMENTS } from '@/lib/seed-data';

async function getPayments() {
  let data = await readStore<Record<string, unknown>>('payments');
  if (data.length === 0) {
    await writeStore('payments', SEED_PAYMENTS);
    data = SEED_PAYMENTS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getPayments();
  const item = data.find((p: any) => p.id === params.id);
  if (!item) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = await getPayments();
  const idx = data.findIndex((p: any) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id: params.id };
  await writeStore('payments', data);
  return NextResponse.json(data[idx]);
}

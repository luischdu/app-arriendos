import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { SEED_PAYMENTS } from '@/lib/seed-data';

async function getPayments() {
  let data = await readStore<Record<string, unknown>>('payments');
  if (data.length === 0) {
    await writeStore('payments', SEED_PAYMENTS);
    data = SEED_PAYMENTS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const status = searchParams.get('status') ?? '';
  let data = await getPayments();
  if (q) {
    data = data.filter((p: any) =>
      p.renterName?.toLowerCase().includes(q) ||
      p.propertyName?.toLowerCase().includes(q),
    );
  }
  if (status && status !== 'all') {
    data = data.filter((p: any) => p.status === status);
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const data = await getPayments();
  const newItem = {
    ...body,
    id: newId(),
    createdAt: new Date().toISOString(),
  };
  data.push(newItem);
  await writeStore('payments', data);
  return NextResponse.json(newItem, { status: 201 });
}

import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { SEED_CONTRACTS } from '@/lib/seed-data';

async function getContracts() {
  let data = await readStore<Record<string, unknown>>('contracts');
  if (data.length === 0) {
    await writeStore('contracts', SEED_CONTRACTS);
    data = SEED_CONTRACTS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const data = await getContracts();
  const filtered = q
    ? data.filter((c: any) =>
        c.renterName?.toLowerCase().includes(q) ||
        c.propertyName?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q),
      )
    : data;
  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const data = await getContracts();
  const year = new Date().getFullYear();
  const num = data.filter((c: any) => c.code?.startsWith(`CON-${year}`)).length + 1;
  const newItem = {
    ...body,
    id: newId(),
    code: `CON-${year}-${String(num).padStart(3, '0')}`,
    status: body.status ?? 'active',
    createdAt: new Date().toISOString(),
  };
  data.push(newItem);
  await writeStore('contracts', data);
  return NextResponse.json(newItem, { status: 201 });
}

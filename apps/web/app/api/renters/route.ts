export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { SEED_RENTERS } from '@/lib/seed-data';

async function getRenters() {
  let data = await readStore<Record<string, unknown>>('renters');
  if (data.length === 0) {
    await writeStore('renters', SEED_RENTERS);
    data = SEED_RENTERS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const data = await getRenters();
  const filtered = q
    ? data.filter((r: any) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.cedula?.includes(q.replace(/\./g, '')),
      )
    : data;
  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const data = await getRenters();
  const newItem = {
    ...body,
    id: newId(),
    status: body.status ?? 'pending',
    since: body.since ?? new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  data.push(newItem);
  await writeStore('renters', data);
  return NextResponse.json(newItem, { status: 201 });
}

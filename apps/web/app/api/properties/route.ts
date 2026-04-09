export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';
import { SEED_PROPERTIES } from '@/lib/seed-data';

async function getProperties() {
  let data = await readStore<Record<string, unknown>>('properties');
  if (data.length === 0) {
    await writeStore('properties', SEED_PROPERTIES);
    data = SEED_PROPERTIES as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const data = await getProperties();
  const filtered = q
    ? data.filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q),
      )
    : data;
  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const data = await getProperties();
  const now = new Date().toISOString();
  const nextNum = data.length + 1;
  const newItem = {
    ...body,
    id: newId(),
    code: body.code || `PROP-${String(nextNum).padStart(3, '0')}`,
    createdAt: now,
  };
  data.push(newItem);
  await writeStore('properties', data);
  return NextResponse.json(newItem, { status: 201 });
}

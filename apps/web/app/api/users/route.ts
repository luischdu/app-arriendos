import { NextResponse } from 'next/server';
import { readStore, writeStore, newId } from '@/lib/store';

const SEED_USERS = [
  {
    id: 'usr-admin',
    fullName: 'Carlos Propietario',
    email: 'admin@arriendospro.com',
    role: 'admin',
    tenantId: 'tenant-001',
    tenantName: 'Inmobiliaria Demo SAS',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

async function getUsers() {
  let data = await readStore<Record<string, unknown>>('users');
  if (data.length === 0) {
    await writeStore('users', SEED_USERS);
    data = SEED_USERS as unknown as Record<string, unknown>[];
  }
  return data;
}

export async function GET() {
  const data = await getUsers();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const data = await getUsers();

  if (data.some((u: any) => u.email === body.email)) {
    return NextResponse.json({ message: 'El email ya existe' }, { status: 400 });
  }

  const newUser = {
    ...body,
    id: newId(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  data.push(newUser);
  await writeStore('users', data);
  return NextResponse.json(newUser, { status: 201 });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return NextResponse.json({ message: 'Token expirado' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }

  return NextResponse.json({
    id: 'demo-user-001',
    email: 'demo@arriendospro.com',
    fullName: 'Carlos Propietario',
    role: 'admin',
    tenantId: 'demo-tenant-001',
    tenantName: 'Inmobiliaria Demo SAS',
  });
}

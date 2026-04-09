export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore } from '@/lib/store';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function formatDate(d: string | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const payments = await readStore<Record<string, any>>('payments');
  const p = payments.find((x) => x.id === params.id);
  if (!p) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

  const total = (p.amount ?? 0) + (p.lateFee ?? 0);
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recibo de Pago</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; max-width: 680px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #1a1a2e; }
    .logo { font-size: 22px; font-weight: 700; }
    .logo span { color: #c9a227; }
    .receipt-num { text-align: right; font-size: 12px; color: #666; }
    .receipt-num strong { font-size: 18px; color: #1a1a2e; display: block; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .field label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .field p { font-size: 14px; font-weight: 600; margin-top: 2px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table th { background: #f5f5f5; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    .table td:last-child { text-align: right; font-weight: 600; }
    .total-row td { font-weight: 700; font-size: 16px; background: #f9f5eb; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Arriendos<span>PRO</span></div>
      <div style="font-size:12px; color:#666; margin-top:4px;">Recibo de Arrendamiento</div>
    </div>
    <div class="receipt-num">
      <strong>Recibo #${p.id.toUpperCase()}</strong>
      Emitido el ${formatDate(new Date().toISOString().slice(0,10))}
    </div>
  </div>

  <h2>Información del pago</h2>
  <div class="grid">
    <div class="field"><label>Arrendatario</label><p>${p.renterName ?? '—'}</p></div>
    <div class="field"><label>Propiedad</label><p>${p.propertyName ?? '—'}</p></div>
    <div class="field"><label>Fecha de vencimiento</label><p>${formatDate(p.dueDate)}</p></div>
    <div class="field"><label>Fecha de pago</label><p>${formatDate(p.paidDate)}</p></div>
    <div class="field"><label>Método de pago</label><p>${p.method ?? '—'}</p></div>
    <div class="field"><label>Estado</label><p>
      <span class="status-badge status-${p.status}">${
        { paid: 'Pagado', overdue: 'En mora', pending: 'Pendiente', partial: 'Parcial' }[p.status as string] ?? p.status
      }</span>
    </p></div>
  </div>

  <h2>Detalle del cobro</h2>
  <table class="table">
    <thead><tr><th>Concepto</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>
      <tr><td>Canon de arrendamiento</td><td>${formatCOP(p.amount ?? 0)}</td></tr>
      ${p.lateFee > 0 ? `<tr><td>Mora por pago tardío</td><td>${formatCOP(p.lateFee)}</td></tr>` : ''}
      ${p.notes ? `<tr><td colspan="2" style="color:#666; font-size:12px; font-style:italic">${p.notes}</td></tr>` : ''}
      <tr class="total-row"><td>TOTAL</td><td>${formatCOP(total)}</td></tr>
    </tbody>
  </table>

  <div class="footer">
    Este documento es un comprobante de pago de ArriendosPRO.<br/>
    Conserve este recibo como soporte de la transacción.
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

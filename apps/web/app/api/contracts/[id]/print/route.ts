export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readStore } from '@/lib/store';

function fmtCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  if (!d) return '___';
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}
function numToWords(n: number): string {
  // Conversión básica para valores grandes
  if (n >= 1_000_000) {
    const m = Math.floor(n / 1_000_000);
    const r = n % 1_000_000;
    return `${m === 1 ? 'UN MILLÓN' : `${m} MILLONES`}${r > 0 ? ` ${numToWords(r)}` : ''}`;
  }
  if (n >= 1000) {
    const k = Math.floor(n / 1000);
    const r = n % 1000;
    return `${k === 1 ? 'MIL' : `${k} MIL`}${r > 0 ? ` ${numToWords(r)}` : ''}`;
  }
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  if (n < 20) return unidades[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const contracts = await readStore<Record<string, any>>('contracts');
  const c = contracts.find((x) => x.id === params.id);
  if (!c) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

  const renters = await readStore<Record<string, any>>('renters');
  const properties = await readStore<Record<string, any>>('properties');
  const renter = renters.find((r) => r.id === c.renterId) ?? {};
  const property = properties.find((p) => p.id === c.propertyId) ?? {};

  const canonEnLetras = numToWords(c.monthlyRent ?? 0);
  const depositoEnLetras = numToWords(c.deposit ?? 0);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Contrato de Arrendamiento ${c.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; background: #fff; padding: 2cm; max-width: 21cm; margin: auto; line-height: 1.6; }
    h1 { text-align: center; font-size: 14pt; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px; }
    .subtitle { text-align: center; font-size: 11pt; margin-bottom: 24px; color: #333; }
    .code { text-align: right; font-size: 10pt; color: #555; margin-bottom: 20px; }
    h2 { font-size: 12pt; text-transform: uppercase; margin: 20px 0 8px; border-bottom: 1px solid #000; padding-bottom: 3px; }
    p { text-align: justify; margin-bottom: 10px; }
    .clause { margin-bottom: 14px; }
    .clause strong { text-transform: uppercase; }
    .signature-section { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
    .signature-box { flex: 1; text-align: center; border-top: 1px solid #000; padding-top: 8px; font-size: 11pt; }
    .footer { margin-top: 40px; font-size: 9pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    @media print { body { padding: 1.5cm; } }
  </style>
</head>
<body>
  <div class="code">Contrato N° ${c.code} | Fecha: ${fmtDate(new Date().toISOString().slice(0,10))}</div>

  <h1>Contrato de Arrendamiento de Inmueble</h1>
  <div class="subtitle">República de Colombia — Ley 820 de 2003</div>

  <h2>Las Partes</h2>
  <p>Entre los suscritos, a saber:</p>
  <p><strong>ARRENDADOR:</strong> El titular del inmueble, quien actúa en calidad de propietario y que en adelante se denominará <strong>EL ARRENDADOR</strong>.</p>
  <p><strong>ARRENDATARIO:</strong> <strong>${renter.fullName ?? c.renterName ?? '_________________'}</strong>, identificado(a) con Cédula de Ciudadanía N° <strong>${renter.cedula ?? '___________'}</strong>, mayor de edad, domiciliado(a) en la ciudad de ${property.city ?? '___________'}, República de Colombia, quien en adelante se denominará <strong>EL ARRENDATARIO</strong>.</p>

  <h2>Cláusula Primera — Objeto del Contrato</h2>
  <div class="clause">
    <p>El ARRENDADOR entrega al ARRENDATARIO, a título de arrendamiento, el inmueble ubicado en: <strong>${property.address ?? c.propertyName ?? '___________________'}</strong>, <strong>${property.city ?? ''}${property.department ? ', ' + property.department : ''}</strong>, República de Colombia, el cual es de su propiedad o se encuentra legítimamente bajo su administración. El inmueble es de tipo <strong>${property.propertyType ?? 'residencial'}</strong> con área aproximada de <strong>${property.areaSqm ?? '___'} m²</strong>.</p>
  </div>

  <h2>Cláusula Segunda — Duración</h2>
  <div class="clause">
    <p>El presente contrato tendrá una duración de <strong>doce (12) meses</strong>, contados a partir del día <strong>${fmtDate(c.startDate)}</strong> y hasta el día <strong>${fmtDate(c.endDate)}</strong>. Vencido este término, el contrato se prorrogará automáticamente por períodos iguales, de conformidad con el artículo 6° de la Ley 820 de 2003, siempre que ninguna de las partes manifieste su intención de darlo por terminado con la antelación prevista en la ley.</p>
  </div>

  <h2>Cláusula Tercera — Canon de Arrendamiento</h2>
  <div class="clause">
    <p>El canon mensual de arrendamiento acordado es de <strong>${fmtCOP(c.monthlyRent ?? 0)}</strong> (${canonEnLetras} PESOS M/CTE), el cual deberá ser pagado por el ARRENDATARIO al ARRENDADOR dentro de los primeros <strong>${c.paymentDay ?? 5}</strong> días de cada mes calendario, mediante transferencia bancaria, consignación o el medio acordado entre las partes.</p>
    <p>De conformidad con el artículo 20 de la Ley 820 de 2003, el canon de arrendamiento podrá ser incrementado anualmente en un porcentaje que no exceda el cien por ciento (100%) del incremento que haya tenido el índice de precios al consumidor en el año calendario inmediatamente anterior al del reajuste. Para el presente contrato, las partes acuerdan un incremento del <strong>${c.incrementPct ?? 5}%</strong> para el primer año, sin perjuicio de los límites legales vigentes.</p>
  </div>

  <h2>Cláusula Cuarta — Depósito en Garantía</h2>
  <div class="clause">
    <p>El ARRENDATARIO entrega al ARRENDADOR la suma de <strong>${fmtCOP(c.deposit ?? 0)}</strong> (${depositoEnLetras} PESOS M/CTE) como depósito en garantía del cumplimiento de las obligaciones derivadas del presente contrato. Dicho depósito será devuelto al ARRENDATARIO al término del contrato, previa verificación del estado del inmueble y del cumplimiento de todas las obligaciones a su cargo.</p>
  </div>

  <h2>Cláusula Quinta — Uso del Inmueble</h2>
  <div class="clause">
    <p>El ARRENDATARIO se compromete a usar el inmueble arrendado única y exclusivamente para uso ${property.propertyType === 'local' || property.propertyType === 'bodega' ? 'comercial' : 'habitacional'}, sin poder cambiar su destinación sin previo consentimiento escrito del ARRENDADOR. Queda expresamente prohibido subarrendar total o parcialmente el inmueble sin autorización escrita del ARRENDADOR.</p>
  </div>

  <h2>Cláusula Sexta — Obligaciones del Arrendatario</h2>
  <div class="clause">
    <p>Son obligaciones del ARRENDATARIO:</p>
    <p>a) Pagar el canon de arrendamiento en la fecha y lugar convenidos; b) Cuidar el inmueble y los bienes recibidos en arrendamiento; c) Efectuar las reparaciones locativas a que haya lugar; d) Pagar los servicios públicos domiciliarios y demás gastos a su cargo; e) Restituir el inmueble al vencimiento del contrato en el mismo estado en que lo recibió, salvo el deterioro natural por el transcurso del tiempo y el uso normal.</p>
  </div>

  <h2>Cláusula Séptima — Obligaciones del Arrendador</h2>
  <div class="clause">
    <p>Son obligaciones del ARRENDADOR: a) Entregar el inmueble en buen estado de servicio, de conformidad con lo convenido; b) Mantener el inmueble en condiciones de uso y habitabilidad; c) Garantizar el uso pacífico del inmueble al ARRENDATARIO durante toda la vigencia del contrato; d) No realizar mejoras o reparaciones que afecten el uso del inmueble sin previo aviso.</p>
  </div>

  <h2>Cláusula Octava — Terminación del Contrato</h2>
  <div class="clause">
    <p>Son causales de terminación del presente contrato, entre otras: a) El vencimiento del plazo pactado; b) El mutuo acuerdo de las partes; c) El incumplimiento de las obligaciones por parte del ARRENDATARIO, especialmente el no pago oportuno del canon; d) La destinación del inmueble para un fin distinto al autorizado; e) Las demás causales previstas en la Ley 820 de 2003 y demás normas concordantes.</p>
  </div>

  <h2>Cláusula Novena — Cláusula Penal</h2>
  <div class="clause">
    <p>En caso de incumplimiento del presente contrato, la parte incumplida deberá pagar a la otra, a título de cláusula penal, una suma equivalente a dos (2) cánones de arrendamiento, sin perjuicio de la obligación de indemnizar los perjuicios que se causen.</p>
  </div>

  <h2>Cláusula Décima — Normas Aplicables</h2>
  <div class="clause">
    <p>El presente contrato se rige por las disposiciones de la Ley 820 de 2003, el Código Civil Colombiano, el Decreto 3130 de 2003 y demás normas concordantes y complementarias vigentes en la República de Colombia.</p>
  </div>

  <h2>Cláusula Décima Primera — Domicilio y Jurisdicción</h2>
  <div class="clause">
    <p>Para los efectos del presente contrato, las partes fijan como domicilio la ciudad de <strong>${property.city ?? 'Medellín'}</strong>, República de Colombia, y se someten a la jurisdicción de los jueces competentes de dicha ciudad.</p>
  </div>

  <p style="margin-top:20px">En señal de aceptación de todas y cada una de las cláusulas del presente contrato, las partes lo suscriben en dos (2) ejemplares del mismo tenor y valor, en la ciudad de <strong>${property.city ?? '___________'}</strong>, a los <strong>${new Date().getDate()}</strong> días del mes de <strong>${new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date())}</strong> de <strong>${new Date().getFullYear()}</strong>.</p>

  <div class="signature-section">
    <div class="signature-box">
      <p><strong>EL ARRENDADOR</strong></p>
      <br/><br/>
      <p>_______________________________</p>
      <p>Nombre: _______________________</p>
      <p>C.C. N°: ______________________</p>
    </div>
    <div class="signature-box">
      <p><strong>EL ARRENDATARIO</strong></p>
      <br/><br/>
      <p>_______________________________</p>
      <p>Nombre: ${renter.fullName ?? c.renterName ?? '___________________'}</p>
      <p>C.C. N°: ${renter.cedula ?? '___________________'}</p>
    </div>
  </div>

  <div class="footer">
    Contrato generado por ArriendosPRO — Conforme a la Ley 820 de 2003 de la República de Colombia<br/>
    ${c.code} | ${fmtDate(new Date().toISOString().slice(0,10))}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

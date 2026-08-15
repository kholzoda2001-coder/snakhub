import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import type { AccountingReport } from './accountingReport';

const AED = (n: number) => `${n.toFixed(2)} AED`;
const dateFmt = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' });

const MARGIN = 40;
const CONTENT_WIDTH = 595.28 - MARGIN * 2; // A4 width minus margins

const COLOR = {
  text: '#1a1a1a',
  muted: '#6b7280',
  accent: '#cc4400',
  positive: '#0d6b47',
  negative: '#b91c1c',
  border: '#d8d8d8',
  headerBg: '#f2f2f2',
};

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string) {
  ensureSpace(doc, 34);
  doc.moveDown(0.7);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLOR.accent).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  const lineY = doc.y + 2;
  doc.moveTo(MARGIN, lineY).lineTo(MARGIN + CONTENT_WIDTH, lineY).strokeColor(COLOR.border).lineWidth(1).stroke();
  doc.y = lineY + 8;
  doc.x = MARGIN;
  doc.font('Helvetica').fillColor(COLOR.text);
}

function kvRow(doc: PDFKit.PDFDocument, label: string, value: string, opts?: { strong?: boolean; tone?: string }) {
  const rowHeight = opts?.strong ? 17 : 14;
  ensureSpace(doc, rowHeight);
  const y = doc.y;
  const leftWidth = CONTENT_WIDTH * 0.62;
  doc.font('Helvetica').fontSize(opts?.strong ? 11 : 10).fillColor(COLOR.muted)
    .text(label, MARGIN, y, { width: leftWidth });
  doc.font(opts?.strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts?.strong ? 11 : 10).fillColor(opts?.tone ?? COLOR.text)
    .text(value, MARGIN + leftWidth, y, { width: CONTENT_WIDTH - leftWidth, align: 'right' });
  doc.y = y + rowHeight;
  doc.x = MARGIN;
}

function note(doc: PDFKit.PDFDocument, text: string, color: string = COLOR.muted) {
  ensureSpace(doc, 20);
  doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(color).text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.font('Helvetica').fillColor(COLOR.text);
  doc.moveDown(0.3);
}

type Col = { width: number; align?: 'left' | 'right' };

function dataTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], columns: Col[]) {
  ensureSpace(doc, 40);
  doc.table({
    columnStyles: columns.map((c) => ({ width: c.width, align: c.align ? { x: c.align } : { x: 'left' } })),
    defaultStyle: (row: number) =>
      row === 0
        ? { font: { family: 'Helvetica-Bold', size: 9 }, backgroundColor: COLOR.headerBg, textColor: COLOR.text, padding: 5, border: [0, 0, 1, 0], borderColor: COLOR.border }
        : { font: { family: 'Helvetica', size: 9 }, textColor: COLOR.text, padding: 5, border: [0, 0, 0.5, 0], borderColor: COLOR.border },
    data: [headers, ...rows],
  });
  doc.moveDown(0.7);
  doc.x = MARGIN;
}

/** The books, laid out as a downloadable PDF — same numbers as the on-screen report. */
export async function renderAccountingPdf(report: AccountingReport): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const t = report.totals;
  const profitTone = t.netProfit >= 0 ? COLOR.positive : COLOR.negative;
  const rangeLabel = report.from || report.to
    ? `${report.from ? dateFmt(report.from) : 'the start'} → ${report.to ? dateFmt(report.to) : 'today'}`
    : 'All time';

  doc.fontSize(19).font('Helvetica-Bold').fillColor(COLOR.accent).text('Snack Hub — Accounting Report');
  doc.fontSize(9.5).font('Helvetica').fillColor(COLOR.muted)
    .text(`Period: ${rangeLabel}`)
    .text(`Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' })}`);
  doc.fillColor(COLOR.text);

  sectionTitle(doc, 'Overview');
  kvRow(doc, 'Cash on hand', AED(t.cashOnHand));
  kvRow(doc, 'Card money (net of fees)', AED(t.cardBalance));
  kvRow(doc, 'Revenue (fulfilled orders)', AED(t.revenue));
  kvRow(doc, 'Net profit', AED(t.netProfit), { strong: true, tone: profitTone });

  if (t.pendingCash > 0 || t.pendingCard > 0) {
    note(doc, `Owed to you but not counted above: ${AED(t.pendingCash)} cash on delivery and ${AED(t.pendingCard)} by card, from orders placed but not yet marked Fulfilled.`);
  }
  if (report.inventory.productsWithoutCost > 0 || t.ordersMissingCost > 0) {
    const missing = report.inventory.productsWithoutCost > 0
      ? `${report.inventory.productsWithoutCost} of ${report.inventory.productCount} products have no cost price`
      : '';
    const missingOrders = t.ordersMissingCost > 0 ? `${t.ordersMissingCost} fulfilled order(s) were sold before costs were recorded` : '';
    note(doc, `Profit is understated: ${[missing, missingOrders].filter(Boolean).join('; ')}.`, COLOR.negative);
  }

  sectionTitle(doc, 'Profit & Loss');
  kvRow(doc, 'Revenue (fulfilled)', AED(t.revenue));
  kvRow(doc, 'Cost of goods sold', `− ${AED(t.costOfGoods)}`);
  kvRow(doc, 'Gross profit', AED(t.grossProfit), { strong: true });
  kvRow(doc, 'Expenses', `− ${AED(t.expenses)}`);
  kvRow(doc, 'Net profit', AED(t.netProfit), { strong: true, tone: profitTone });

  sectionTitle(doc, 'Where the money is');
  kvRow(doc, 'Cash collected', AED(t.cashCollected));
  kvRow(doc, 'Cash spent', `− ${AED(t.cashExpenses)}`);
  kvRow(doc, 'Cash on hand', AED(t.cashOnHand), { strong: true });
  kvRow(doc, 'Card collected', AED(t.cardCollected));
  kvRow(doc, 'Card spent', `− ${AED(t.cardExpenses)}`);
  kvRow(doc, 'Card balance', AED(t.cardBalance), { strong: true });

  sectionTitle(doc, 'Payment processing (Ziina)');
  kvRow(doc, 'Card revenue (gross)', AED(t.cardCollected));
  kvRow(doc, 'Ziina fees (estimated)', `− ${AED(report.paymentFees.total)}`);
  kvRow(doc, 'Net from card sales', AED(t.cardCollected - report.paymentFees.total), { strong: true });
  note(doc, `Estimated at 2.6% + 1 AED + 5% VAT for ${report.paymentFees.count} fulfilled card order(s). Non-AED cards cost Ziina — and so you — an extra 1.5% this does not include.`);

  const categoryTotals = new Map<string, number>();
  for (const e of report.expenses) categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
  const categoryRows = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);
  if (categoryRows.length > 0) {
    const catTotal = categoryRows.reduce((sum, [, v]) => sum + v, 0);
    sectionTitle(doc, 'Spend by category');
    dataTable(
      doc,
      ['Category', 'Amount', '%'],
      categoryRows.map(([cat, amt]) => [cat, AED(amt), `${catTotal > 0 ? Math.round((amt / catTotal) * 100) : 0}%`]),
      [{ width: 300 }, { width: 115, align: 'right' }, { width: 100, align: 'right' }]
    );
  }

  sectionTitle(doc, `Expenses (${report.expenses.length})`);
  if (report.expenses.length === 0) {
    doc.fontSize(10).fillColor(COLOR.muted).text('No expenses recorded in this period.');
  } else {
    dataTable(
      doc,
      ['Date', 'Category', 'Note', 'Paid with', 'Amount'],
      report.expenses.map((e) => [dateFmt(e.date), e.category, e.note || '—', e.paidWith === 'cash' ? 'Cash' : 'Card / bank', AED(e.amount)]),
      [{ width: 65 }, { width: 85 }, { width: 165 }, { width: 75 }, { width: 125, align: 'right' }]
    );
  }

  sectionTitle(doc, `Transactions (${report.ledger.length})`);
  if (report.ledger.length === 0) {
    doc.fontSize(10).fillColor(COLOR.muted).text('Nothing yet. Sales appear here once an order is marked Fulfilled.');
  } else {
    dataTable(
      doc,
      ['Date', 'Description', 'Method', 'In / out'],
      report.ledger.map((x) => [dateFmt(x.date), x.label, x.method === 'cash' ? 'Cash' : 'Card', `${x.amount >= 0 ? '+' : '−'} ${AED(Math.abs(x.amount))}`]),
      [{ width: 75 }, { width: 180 }, { width: 80 }, { width: 180, align: 'right' }]
    );
  }

  doc.end();
  return finished;
}

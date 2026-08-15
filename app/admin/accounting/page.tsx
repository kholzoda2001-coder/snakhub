'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Totals = {
  revenue: number; costOfGoods: number; grossProfit: number; expenses: number; netProfit: number;
  cashCollected: number; cardCollected: number; cashExpenses: number; cardExpenses: number;
  cashOnHand: number; cardBalance: number; pendingCash: number; pendingCard: number;
  fulfilledOrders: number; ordersMissingCost: number;
};
type Txn = { id: string; date: string; kind: 'sale' | 'expense'; label: string; method: 'cash' | 'card'; amount: number };
type Expense = { id: number; date: string; category: string; amount: number; paidWith: string; note: string | null };
type Report = {
  totals: Totals;
  ledger: Txn[];
  inventory: { productsWithoutCost: number; productCount: number };
  paymentFees: { total: number; count: number };
  expenses: Expense[];
};

const CATEGORIES = ['Stock', 'Product Expenses', 'Payment Fees', 'Rent', 'Salary', 'Delivery', 'Marketing', 'Meta Ads', 'Utilities', 'Other'];
const AED = (n: number) => `${n.toFixed(2)} AED`;
const today = () => new Date().toISOString().slice(0, 10);

function Money({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="dash-card">
      <h3>{label}</h3>
      <div className="value" style={tone ? { color: tone } : undefined}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{sub}</div>}
    </div>
  );
}

/** Ranked, single-hue bars — one series (spend), so length carries the comparison and no legend is needed. */
function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const rows = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  if (rows.length === 0) return null;

  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const max = rows[0].amount;

  return (
    <div className="dash-card" style={{ marginBottom: '20px' }}>
      <h3>Spend by category</h3>
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map(r => (
          <div key={r.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700 }}>{r.category}</span>
              <span style={{ color: 'var(--admin-muted)' }}>
                {AED(r.amount)} · {total > 0 ? Math.round((r.amount / total) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: '10px', borderRadius: '3px', background: 'var(--admin-raised)' }}>
              <div style={{
                height: '100%',
                width: `${max > 0 ? (r.amount / max) * 100 : 0}%`,
                background: 'var(--admin-primary)',
                borderRadius: '0 3px 3px 0',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: strong ? '12px 0 0' : '7px 0',
      borderTop: strong ? '2px solid var(--admin-border-hover)' : 'none',
      marginTop: strong ? '6px' : 0,
      fontWeight: strong ? 900 : 600, fontSize: strong ? '16px' : '14px',
    }}>
      <span style={{ color: strong ? 'var(--admin-text)' : 'var(--admin-muted)' }}>{label}</span>
      <span style={{ color: tone || 'var(--admin-text)' }}>{value}</span>
    </div>
  );
}

export default function AdminAccounting() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today(), category: 'Stock', amount: '', paidWith: 'cash', note: '' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    fetch(`/api/admin/accounting?${qs}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then(setReport)
      .catch(() => setError('Could not load the report.'))
      .finally(() => setLoading(false));
  }, [from, to]);

  // Same date range as the on-screen report — a plain link so the browser's
  // own download flow handles it, no fetch/blob dance needed.
  const pdfHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const query = qs.toString();
    return `/api/admin/accounting/pdf${query ? `?${query}` : ''}`;
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setForm({ date: today(), category: 'Stock', amount: '', paidWith: 'cash', note: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the expense.');
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/admin/expenses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete rejected');
    } catch {
      setError('Could not delete that expense.');
    }
    load();
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading accounts…</div>;
  if (!report) return <div style={{ padding: '20px' }}>{error || 'No data.'}</div>;

  const { totals: t, inventory: inv, paymentFees: pf } = report;
  const profitTone = t.netProfit >= 0 ? '#0d6b47' : 'var(--admin-danger)';

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Accounting</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} aria-label="From date" />
          <span style={{ color: 'var(--admin-muted)' }}>→</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} aria-label="To date" />
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }} style={{ ...inputStyle, cursor: 'pointer', width: 'auto' }}>All time</button>
          )}
          <a href={pdfHref} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Download PDF
          </a>
        </div>
      </div>

      {/* Money you are holding right now */}
      <div className="dash-grid">
        <Money label="Cash on hand" value={AED(t.cashOnHand)} sub={`${AED(t.cashCollected)} collected − ${AED(t.cashExpenses)} spent`} />
        <Money label="Card money" value={AED(t.cardBalance)} sub={`Received through Ziina`} />
        <Money label="Revenue" value={AED(t.revenue)} sub={`${t.fulfilledOrders} fulfilled orders`} />
        <Money label="Net profit" value={AED(t.netProfit)} tone={profitTone} sub="After stock cost and expenses" />
      </div>

      {(t.pendingCash > 0 || t.pendingCard > 0) && (
        <div style={{ background: 'var(--admin-card)', border: '1px dashed var(--admin-border-hover)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '18px', fontSize: '13.5px' }}>
          <strong>Owed to you:</strong> {AED(t.pendingCash)} cash on delivery and {AED(t.pendingCard)} by card, from orders placed but not yet fulfilled.
          {' '}This is not counted above — money becomes real when you mark an order Fulfilled.
        </div>
      )}

      {(inv.productsWithoutCost > 0 || t.ordersMissingCost > 0) && (
        <div style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.35)', color: '#94430a', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '18px', fontSize: '13.5px', fontWeight: 600 }}>
          ⚠️ Profit is understated.{' '}
          {inv.productsWithoutCost > 0 && <>{inv.productsWithoutCost} of {inv.productCount} products have no cost price. </>}
          {t.ordersMissingCost > 0 && <>{t.ordersMissingCost} fulfilled order(s) were sold before costs were recorded. </>}
          <Link href="/admin/products" style={{ color: '#94430a', fontWeight: 800 }}>Add cost prices →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="dash-card">
          <h3>Profit &amp; Loss</h3>
          <div style={{ marginTop: '6px' }}>
            <Row label="Revenue (fulfilled)" value={AED(t.revenue)} />
            <Row label="Cost of goods sold" value={`− ${AED(t.costOfGoods)}`} />
            <Row label="Gross profit" value={AED(t.grossProfit)} strong />
            <Row label="Expenses" value={`− ${AED(t.expenses)}`} />
            <Row label="Net profit" value={AED(t.netProfit)} strong tone={profitTone} />
          </div>
        </div>

        <div className="dash-card">
          <h3>Where the money is</h3>
          <div style={{ marginTop: '6px' }}>
            <Row label="Cash collected" value={AED(t.cashCollected)} />
            <Row label="Cash spent" value={`− ${AED(t.cashExpenses)}`} />
            <Row label="Cash on hand" value={AED(t.cashOnHand)} strong />
            <Row label="Card collected" value={AED(t.cardCollected)} />
            <Row label="Card spent" value={`− ${AED(t.cardExpenses)}`} />
            <Row label="Card balance" value={AED(t.cardBalance)} strong />
          </div>
        </div>

        <div className="dash-card">
          <h3>Payment processing</h3>
          <div style={{ marginTop: '6px' }}>
            <Row label="Card revenue (gross)" value={AED(t.cardCollected)} />
            <Row label="Ziina fees (est.)" value={`− ${AED(pf.total)}`} />
            <Row label="Net from card sales" value={AED(t.cardCollected - pf.total)} strong />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--admin-muted)', marginTop: '8px' }}>
            Auto-estimated at 2.6% + 1 AED + 5% VAT when a card order is marked Fulfilled
            ({pf.count} order{pf.count === 1 ? '' : 's'}). Non-AED cards cost Ziina an extra 1.5%
            this doesn&apos;t include — add a manual Payment Fees expense to true it up.
          </div>
        </div>
      </div>

      <CategoryBreakdown expenses={report.expenses} />

      {/* Expenses */}
      <div className="page-header" style={{ marginTop: '10px' }}>
        <h2 className="page-title" style={{ fontSize: '22px' }}>Expenses</h2>
      </div>

      <form onSubmit={addExpense} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px', marginBottom: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', alignItems: 'end' }}>
        <div><label>Date</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
        <div><label>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label>Amount (AED)</label><input type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} placeholder="0.00" /></div>
        <div><label>Paid with</label>
          <select value={form.paidWith} onChange={e => setForm({ ...form, paidWith: e.target.value })} style={inputStyle}>
            <option value="cash">Cash</option>
            <option value="card">Card / bank</option>
          </select>
        </div>
        <div><label>Note</label><input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={inputStyle} placeholder="Optional" /></div>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : '+ Add expense'}</button>
      </form>

      {error && <div style={{ color: 'var(--admin-danger)', fontWeight: 700, marginBottom: '14px' }}>{error}</div>}

      <div className="admin-table-wrap" style={{ marginBottom: '26px' }}>
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Paid with</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {report.expenses.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No expenses recorded in this period.</td></tr>
            ) : report.expenses.map(x => (
              <tr key={x.id}>
                <td>{new Date(x.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })}</td>
                <td style={{ fontWeight: 700 }}>{x.category}</td>
                <td style={{ color: 'var(--admin-muted)' }}>{x.note || '—'}</td>
                <td>{x.paidWith === 'cash' ? 'Cash' : 'Card / bank'}</td>
                <td style={{ fontWeight: 800 }}>{AED(x.amount)}</td>
                <td><button onClick={() => removeExpense(x.id)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-danger)', fontWeight: 700, cursor: 'pointer' }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ledger */}
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '22px' }}>Transactions</h2>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Description</th><th>Method</th><th>In / out</th></tr></thead>
          <tbody>
            {report.ledger.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Nothing yet. Sales appear here once an order is marked Fulfilled.</td></tr>
            ) : report.ledger.map(x => (
              <tr key={x.id}>
                <td>{new Date(x.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })}</td>
                <td style={{ fontWeight: 700 }}>{x.label}</td>
                <td>{x.method === 'cash' ? 'Cash' : 'Card'}</td>
                <td style={{ fontWeight: 800, color: x.amount >= 0 ? '#0d6b47' : 'var(--admin-danger)' }}>
                  {x.amount >= 0 ? '+' : '−'} {AED(Math.abs(x.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '4px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-raised)',
  color: 'var(--admin-text)',
};

'use client';
import React, { useEffect, useState } from 'react';
import {
  DEFAULT_ESTIMATE,
  FALLBACK_ESTIMATES,
  parseEstimates,
  serialiseEstimates,
  SETTINGS_KEY as DELIVERY_KEY,
  UAE_CITIES,
  type DeliveryEstimates,
} from '../../../lib/delivery';
import type { ShopCategory } from '../../../lib/types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginTop: '4px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-raised)',
  color: 'var(--admin-text)',
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    ziina_api_key: '',
    ziina_enabled: 'true',
    ziina_test_mode: 'true',
    telegram_bot_token: '',
    // telegram_chat_id is not held here — it is edited per owner in `chatIds`
    // and joined back into the one stored key on save.
    track_stock: 'false'
  });

  // The API never sends a stored secret back, only whether one exists. Leaving
  // the box empty keeps what is saved; typing replaces it.
  const [secretSaved, setSecretSaved] = useState({ ziina: false, telegram: false });

  // Both owners need the order alerts, so the one stored `telegram_chat_id`
  // holds a comma-separated list (the sender already posts to each in turn).
  // It is edited as one box per owner and joined back on save.
  const [chatIds, setChatIds] = useState<string[]>(['', '']);
  const setChatId = (index: number, value: string) =>
    setChatIds(prev => prev.map((id, i) => (i === index ? value : id)));

  // Turning tracking on while products still sit at qty 0 takes the whole shop
  // out of stock at once, so the count is loaded up front to warn about it.
  const [zeroStockCount, setZeroStockCount] = useState(0);
  // Delivery times live as JSON under one settings key; edited here as a form.
  const [estimates, setEstimates] = useState<DeliveryEstimates>(FALLBACK_ESTIMATES);
  // Card-only categories cannot be bought at all while Ziina is off, so the
  // switch here needs to say what it takes down with it.
  const [cardOnlyCats, setCardOnlyCats] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCardOnlyCats((data as ShopCategory[]).filter((c) => c.cardOnly).map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products?admin=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setZeroStockCount(data.filter((p: { stock?: number | null }) => (p.stock ?? 0) <= 0).length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({
            ...prev,
            ...data
          }));
          setSecretSaved({
            ziina: data.ziina_api_key_set === 'true',
            telegram: data.telegram_bot_token_set === 'true',
          });
          // A shop saved before the second box existed has a single ID; the
          // padding keeps an empty slot for the other owner either way.
          const savedIds = String(data.telegram_chat_id || '')
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean);
          setChatIds([savedIds[0] ?? '', savedIds[1] ?? '', ...savedIds.slice(2)]);
          setEstimates(parseEstimates(data[DELIVERY_KEY]));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Blanks are dropped and duplicates collapsed — the same ID left in both
      // boxes would otherwise send that owner two copies of every order.
      const joinedChatIds = Array.from(
        new Set(chatIds.map(id => id.trim()).filter(Boolean))
      ).join(',');

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Delivery times are edited as a form but stored as one JSON value.
        body: JSON.stringify({
          ...settings,
          telegram_chat_id: joinedChatIds,
          [DELIVERY_KEY]: serialiseEstimates(estimates),
        })
      });
      if (res.ok) {
        // A secret that was just typed is now stored, and the box is cleared —
        // it is write-only from here, exactly as it is after a page load.
        setSecretSaved(prev => ({
          ziina: prev.ziina || settings.ziina_api_key.trim().length > 0,
          telegram: prev.telegram || (settings.telegram_bot_token || '').trim().length > 0,
        }));
        setSettings(prev => ({ ...prev, ziina_api_key: '', telegram_bot_token: '' }));
        alert('Settings saved successfully!');
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving settings.:', err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading settings...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Global Settings</h1>
      </div>
      
      <div style={{ background: 'var(--admin-card)', padding: '30px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', maxWidth: '600px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>Ziina Payment Gateway</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Enter your Ziina Secret API Key to receive online payments.
            </p>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Ziina API Key</label>
            <input
              type="password"
              autoComplete="off"
              value={settings.ziina_api_key}
              onChange={e => setSettings({ ...settings, ziina_api_key: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
              placeholder={secretSaved.ziina ? 'A key is saved — leave blank to keep it' : 'e.g. zpk_...'}
            />
            <p style={{ fontSize: '12.5px', color: 'var(--admin-muted)', marginTop: '6px' }}>
              {secretSaved.ziina
                ? '🔒 A key is saved. It is never shown again — leave this blank to keep it, or type a new one to replace it.'
                : '⚠️ No key saved yet. Online payments will not work until one is entered.'}
            </p>
            
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="ziinaEnabled"
                checked={settings.ziina_enabled === 'true'}
                onChange={e => setSettings({ ...settings, ziina_enabled: e.target.checked ? 'true' : 'false' })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="ziinaEnabled" style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Enable Online Payments (Ziina)
              </label>
            </div>

            {settings.ziina_enabled !== 'true' && cardOnlyCats.length > 0 && (
              <div style={{ marginTop: '10px', padding: '12px 14px', borderRadius: 'var(--r-sm)', background: 'rgba(204,68,0,.08)', border: '1px solid var(--admin-accent)', fontSize: '13px', lineHeight: 1.6 }}>
                <strong>Card payments are off, so nothing in {cardOnlyCats.join(', ')} can be bought.</strong>{' '}
                Those categories are set to card only, so cash on delivery is refused for them and
                there is no other way to pay. Turn Ziina on, or clear “Card payment only” on the
                category.
              </div>
            )}

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="testMode"
                checked={settings.ziina_test_mode === 'true'}
                onChange={e => setSettings({ ...settings, ziina_test_mode: e.target.checked ? 'true' : 'false' })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="testMode" style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Enable Test Mode (No real charges)
              </label>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--orange)', marginTop: '8px' }}>
              ⚠️ If checked, Ziina will not charge real money. Uncheck this when you are ready to accept real payments.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)' }} />

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>Telegram Notifications 🤖</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Receive instant order notifications on Telegram.
            </p>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Bot Token</label>
            <input
              type="password"
              autoComplete="off"
              value={settings.telegram_bot_token || ''}
              onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
              placeholder={secretSaved.telegram ? 'A token is saved — leave blank to keep it' : 'e.g. 123456789:ABCdefGHI...'}
            />
            <p style={{ fontSize: '12.5px', color: 'var(--admin-muted)', margin: '6px 0 15px' }}>
              {secretSaved.telegram
                ? '🔒 A token is saved. Leave blank to keep it, or type a new one to replace it.'
                : 'No token saved yet — order notifications are off.'}
            </p>
            
            {chatIds.map((id, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <label
                  htmlFor={`chatId${i}`}
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
                >
                  Chat ID {i + 1} {i === 0 ? '(Owner 1)' : `(Owner ${i + 1} — optional)`}
                </label>
                <input
                  id={`chatId${i}`}
                  type="text"
                  value={id}
                  onChange={e => setChatId(i, e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
                  placeholder="e.g. -1001234567890 or 1234567"
                />
              </div>
            ))}
            <p style={{ fontSize: '12.5px', color: 'var(--admin-muted)', marginTop: '6px' }}>
              Every order is sent to each Chat ID filled in above, so both owners get it.
              Leave the second blank to notify one owner only.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--orange)', marginTop: '6px' }}>
              ⚠️ Each owner must press <b>Start</b> in the bot once — Telegram blocks messages
              to anyone who has not opened a chat with it.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)' }} />

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>Inventory 📦</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="trackStock"
                checked={settings.track_stock === 'true'}
                onChange={e => {
                  if (e.target.checked && zeroStockCount > 0) {
                    const ok = confirm(
                      `${zeroStockCount} product(s) still have a quantity of 0.\n\n` +
                      `Turn tracking on now and they will immediately show "Out of stock" ` +
                      `and cannot be ordered.\n\nSet their QTY in Products first, or continue anyway?`
                    );
                    if (!ok) return;
                  }
                  setSettings({ ...settings, track_stock: e.target.checked ? 'true' : 'false' });
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="trackStock" style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Track stock levels
              </label>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--orange)', marginTop: '8px' }}>
              ⚠️ When on, every order reduces the product&apos;s stock and customers cannot order more than you have.
              Set a real stock number on every product before turning this on, otherwise orders will be rejected.
            </p>
            {zeroStockCount > 0 && (
              <p style={{ fontSize: '13px', color: 'var(--admin-danger)', marginTop: '6px', fontWeight: 700 }}>
                🚫 {zeroStockCount} product(s) currently have QTY 0. They will show as
                &quot;Out of stock&quot; the moment tracking is switched on.
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)' }} />

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Delivery times 🚚</h2>
            <p style={{ fontSize: '13px', color: 'var(--admin-muted)', marginBottom: '12px' }}>
              Shown at checkout before the customer orders, and on the order confirmation.
              Leave an emirate blank to use the default.
            </p>

            <label>Default (used where no emirate is set)</label>
            <input
              type="text"
              value={estimates.default}
              onChange={e => setEstimates({ ...estimates, default: e.target.value })}
              placeholder={DEFAULT_ESTIMATE}
              style={inputStyle}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginTop: '12px' }}>
              {UAE_CITIES.map(city => (
                <div key={city}>
                  <label style={{ fontSize: '13px' }}>{city}</label>
                  <input
                    type="text"
                    value={estimates.byCity[city] ?? ''}
                    onChange={e => setEstimates({ ...estimates, byCity: { ...estimates.byCity, [city]: e.target.value } })}
                    placeholder={estimates.default || DEFAULT_ESTIMATE}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)' }} />

          <button
            type="submit"
            disabled={saving}
            style={{ 
              alignSelf: 'flex-start', padding: '12px 24px', background: 'var(--admin-primary)', color: '#fff', 
              border: 'none', borderRadius: 'var(--r-md)', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 800,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </>
  );
}

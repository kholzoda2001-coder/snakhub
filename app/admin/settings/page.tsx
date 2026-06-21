'use client';
import React, { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    ziina_api_key: '',
    ziina_enabled: 'true',
    ziina_test_mode: 'true',
    telegram_bot_token: '',
    telegram_chat_id: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({
            ...prev,
            ...data
          }));
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
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
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
              value={settings.ziina_api_key}
              onChange={e => setSettings({ ...settings, ziina_api_key: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
              placeholder="e.g. zpk_..."
            />
            
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
              type="text" 
              value={settings.telegram_bot_token || ''}
              onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)', marginBottom: '15px' }}
              placeholder="e.g. 123456789:ABCdefGHI..."
            />
            
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Chat ID</label>
            <input 
              type="text" 
              value={settings.telegram_chat_id || ''}
              onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
              placeholder="e.g. -1001234567890 or 1234567"
            />
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

import { useEffect, useState } from 'react';
import api from '../api';

export default function Settings() {
  const [waStatus, setWaStatus] = useState({ status: 'disconnected', qrCode: null });
  const [geminiKeys, setGeminiKeys] = useState([]);
  const [gmailTest, setGmailTest] = useState(null);
  const [testingGmail, setTestingGmail] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    api.get('/api/settings/whatsapp/status').then(r => setWaStatus(r.data)).catch(() => {});
    api.get('/api/settings/gemini-keys').then(r => setGeminiKeys(r.data.keys)).catch(() => {});
  }, []);

  useEffect(() => {
    if (waStatus.status === 'qr_ready' || waStatus.status === 'initializing') {
      const interval = setInterval(() => {
        api.get('/api/settings/whatsapp/status').then(r => setWaStatus(r.data)).catch(() => {});
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [waStatus.status]);

  const connectWhatsApp = async () => {
    await api.post('/api/settings/whatsapp/connect');
    setWaStatus({ status: 'initializing' });
    showToast('Initializing WhatsApp... QR code will appear shortly');
  };

  const disconnectWhatsApp = async () => {
    await api.post('/api/settings/whatsapp/disconnect');
    setWaStatus({ status: 'disconnected', qrCode: null });
  };

  const testGmail = async () => {
    setTestingGmail(true);
    try {
      const res = await api.post('/api/settings/test-gmail');
      setGmailTest({ success: true, message: res.data.message });
    } catch (err) {
      setGmailTest({ success: false, message: err.response?.data?.message || 'Connection failed' });
    } finally {
      setTestingGmail(false);
    }
  };

  const waColor = {
    connected: 'var(--green)',
    qr_ready: 'var(--gold)',
    initializing: 'var(--gold)',
    disconnected: 'var(--text-dim)',
    failed: 'var(--red)'
  }[waStatus.status] || 'var(--text-dim)';

  return (
    <div style={{ padding: 32, maxWidth: 700 }} className="fade-in">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--gold)',
          padding: '12px 20px', borderRadius: 8, color: 'var(--text)', fontSize: 14
        }}>{toast}</div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Connect your accounts and check your configuration</p>
      </div>

      <Section title="Gmail" icon="📧">
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
          Gmail uses the <strong>GMAIL_ADDRESS</strong> and <strong>GMAIL_APP_PASSWORD</strong> environment variables set on Railway.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={testGmail} disabled={testingGmail} style={btnOutline}>
            {testingGmail ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Testing...</> : '🔌 Test Gmail Connection'}
          </button>
          {gmailTest && (
            <span style={{ fontSize: 13, color: gmailTest.success ? 'var(--green)' : 'var(--red)' }}>
              {gmailTest.success ? '✅' : '❌'} {gmailTest.message}
            </span>
          )}
        </div>
      </Section>

      <Section title="WhatsApp" icon="💬">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: waColor }} />
          <span style={{ fontSize: 13, color: waColor, fontWeight: 600, textTransform: 'capitalize' }}>
            {waStatus.status.replace('_', ' ')}
          </span>
        </div>

        {waStatus.status === 'qr_ready' && waStatus.qrCode && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--gold)', marginBottom: 12 }}>
              📱 Open WhatsApp → Linked Devices → Link a Device → Scan this QR code
            </p>
            <img src={waStatus.qrCode} alt="QR Code" style={{ width: 220, height: 220, borderRadius: 8, border: '2px solid var(--gold)' }} />
          </div>
        )}

        {waStatus.status === 'initializing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--gold)', fontSize: 13 }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            Generating QR code...
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {waStatus.status !== 'connected' && (
            <button onClick={connectWhatsApp} style={btnGold}>Connect WhatsApp</button>
          )}
          {waStatus.status === 'connected' && (
            <button onClick={disconnectWhatsApp} style={btnOutline}>Disconnect</button>
          )}
        </div>
      </Section>

      <Section title="Gemini API Keys" icon="◉">
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
          Set <strong>GEMINI_KEY_1</strong>, <strong>GEMINI_KEY_2</strong>, etc. in Railway. The system rotates through them automatically.
        </p>
        {geminiKeys.length === 0 ? (
          <div style={{ color: 'var(--red)', fontSize: 13 }}>⚠️ No Gemini keys detected. Add GEMINI_KEY_1 to Railway environment variables.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {geminiKeys.map(k => (
              <div key={k.index} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', padding: '8px 14px', borderRadius: 6 }}>
                <span className="badge badge-green">KEY {k.index}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>...{k.preview}</span>
                <span style={{ fontSize: 12, color: 'var(--green)', marginLeft: 'auto' }}>✓ Active</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
              {geminiKeys.length} key{geminiKeys.length > 1 ? 's' : ''} = ~{geminiKeys.length * 1000} free requests/day
            </div>
          </div>
        )}
      </Section>

      <Section title="Environment Variables Guide" icon="◌">
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>Set these in your Railway project → Variables:</p>
        {[
          { key: 'DATABASE_URL', desc: 'Auto-set by Railway when you add PostgreSQL' },
          { key: 'GEMINI_KEY_1', desc: 'From aistudio.google.com → Get API Key' },
          { key: 'GMAIL_ADDRESS', desc: 'Your Gmail address' },
          { key: 'GMAIL_APP_PASSWORD', desc: 'Google Account → Security → App Passwords' },
          { key: 'GOOGLE_MAPS_API_KEY', desc: 'Google Cloud Console → Maps Platform' },
          { key: 'JWT_SECRET', desc: 'Any long random string' },
          { key: 'FRONTEND_URL', desc: 'Your Vercel app URL' },
          { key: 'TELEGRAM_BOT_TOKEN', desc: 'From @BotFather on Telegram (optional)' },
          { key: 'TELEGRAM_CHAT_ID', desc: 'Your Telegram chat ID (optional)' },
        ].map(({ key, desc }) => (
          <div key={key} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gold)', minWidth: 200 }}>{key}</code>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{desc}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

const Section = ({ title, icon, children }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 16 }}>
    <h2 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{icon}</span> {title}
    </h2>
    {children}
  </div>
);

const btnGold = { background: 'var(--gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const btnOutline = { background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };

import { useEffect, useState } from 'react';
import api from '../api';

export default function Outreach() {
  const [tab, setTab] = useState('pending');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pending' ? '/api/outreach/pending' : tab === 'sent' ? '/api/outreach/sent' : '/api/outreach/replies';
      const res = await api.get(endpoint);
      setMessages(res.data);
    } catch {
      showToast('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [tab]);

  const approve = async (id) => {
    await api.patch(`/api/outreach/${id}/approve`);
    setMessages(prev => prev.filter(m => m.id !== id));
    showToast('✅ Approved!');
  };

  const skip = async (id) => {
    await api.patch(`/api/outreach/${id}/skip`);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const approveAll = async () => {
    await api.post('/api/outreach/approve-all');
    showToast('✅ All messages approved!');
    fetchMessages();
  };

  const sendApproved = async () => {
    setSending(true);
    try {
      const res = await api.post('/api/outreach/send-approved');
      showToast(`📨 ${res.data.sent} messages sent! ${res.data.failed > 0 ? `(${res.data.failed} failed)` : ''}`);
      fetchMessages();
    } catch (err) {
      showToast(err.response?.data?.error || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (id) => {
    await api.patch(`/api/outreach/${id}/edit`, { content: editContent });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editContent } : m));
    setEditingId(null);
    showToast('✏️ Message updated');
  };

  const tabs = [
    { key: 'pending', label: 'Pending Review' },
    { key: 'sent', label: 'Sent' },
    { key: 'replies', label: 'Replies' }
  ];

  return (
    <div style={{ padding: 32 }} className="fade-in">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--gold)',
          padding: '12px 20px', borderRadius: 8, color: 'var(--text)', fontSize: 14
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Outreach</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Review, approve and send your messages</p>
        </div>
        {tab === 'pending' && messages.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={approveAll} style={btnOutline}>✓ Approve All</button>
            <button onClick={sendApproved} disabled={sending} style={btnGold}>
              {sending ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000' }} /> Sending...</> : '◈ Send Approved'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 16px', borderRadius: 6, border: 'none',
            background: tab === t.key ? 'var(--surface2)' : 'transparent',
            color: tab === t.key ? 'var(--text)' : 'var(--text-dim)',
            fontWeight: tab === t.key ? 600 : 400, fontSize: 13, transition: 'all 0.15s'
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : messages.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>◈</div>
          {tab === 'pending' ? 'No messages pending. Go to Leads and click "Draft Messages".' : 'Nothing here yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden'
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontWeight: 700 }}>{msg.business_name}</div>
                  <span className={`badge badge-${msg.channel === 'email' ? 'blue' : 'green'}`}>{msg.channel}</span>
                  {msg.category && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{msg.category}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                  {msg.phone || msg.email || '—'}
                </div>
              </div>

              <div style={{ padding: '14px 18px' }}>
                {editingId === msg.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={8}
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: 12, color: 'var(--text)', fontSize: 13,
                        resize: 'vertical', outline: 'none', width: '100%', fontFamily: 'var(--mono)'
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => saveEdit(msg.id)} style={btnGold}>Save</button>
                      <button onClick={() => setEditingId(null)} style={btnOutline}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--mono)',
                    whiteSpace: 'pre-wrap', lineHeight: 1.7,
                    maxHeight: 160, overflow: 'auto',
                    background: 'var(--surface2)', padding: '12px 14px', borderRadius: 6
                  }}>
                    {msg.content}
                  </div>
                )}
              </div>

              {tab === 'pending' && editingId !== msg.id && (
                <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <button onClick={() => approve(msg.id)} style={{ ...btnGold, fontSize: 12, padding: '6px 14px' }}>✓ Approve</button>
                  <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} style={{ ...btnOutline, fontSize: 12, padding: '6px 14px' }}>✏️ Edit</button>
                  <button onClick={() => skip(msg.id)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>✕ Skip</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnGold = {
  background: 'var(--gold)', color: '#000', border: 'none',
  padding: '8px 16px', borderRadius: 'var(--radius)',
  fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
};
const btnOutline = {
  background: 'none', border: '1px solid var(--border)', color: 'var(--text)',
  padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, cursor: 'pointer'
};

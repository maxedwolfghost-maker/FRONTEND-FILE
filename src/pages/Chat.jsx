import { useState, useEffect, useRef } from 'react';
import api from '../api';

const SUGGESTIONS = [
  'Search for salons in Abuja',
  'Search for restaurants in Wuse',
  'Search for event planners in Gwarinpa',
  'Search for barbershops in Maitama',
  'What are my stats?',
  'Search for photographers in Abuja',
];

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your lead generation AI.\n\nTell me what type of business to search for and I'll find businesses in Abuja (or any city) that don't have websites.\n\nTry: **"Search for salons in Abuja"**`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/api/chat', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, action: res.data.action }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', padding: '0 32px' }}>
      <div style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>AI Chat</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Give instructions, start searches, and control your system</p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? 'var(--gold)' : 'var(--surface)',
              color: msg.role === 'user' ? '#000' : 'var(--text)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 14, lineHeight: 1.6
            }}>
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              ) : (
                msg.content
              )}
              {msg.action?.type === 'search' && (
                <div style={{
                  marginTop: 10, padding: '8px 12px',
                  background: 'rgba(245,166,35,0.1)', borderRadius: 6,
                  fontSize: 12, color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.2)'
                }}>
                  🔍 Search ID: {msg.action.searchId} — Check Leads tab in ~30 seconds
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px', borderRadius: '12px 12px 12px 2px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', gap: 4, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--text-dim)',
                  animation: 'pulse 1.2s ease infinite',
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div style={{ padding: '0 0 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-dim)', padding: '6px 12px', borderRadius: 20,
              fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-dim)'; }}
            >{s}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 0 24px', display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder='Type a command or question...'
          style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 16px', color: 'var(--text)',
            fontSize: 14, outline: 'none'
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            background: 'var(--gold)', border: 'none', color: '#000',
            padding: '12px 20px', borderRadius: 8, fontWeight: 700,
            fontSize: 14, cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
      }

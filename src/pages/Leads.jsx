import { useEffect, useState } from 'react';
import api from '../api';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [channel, setChannel] = useState('email');
  const [toast, setToast] = useState('');
  const [searchRunning, setSearchRunning] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get('/api/leads', { params });
      setLeads(res.data.leads);
      setTotal(res.data.total);
    } catch (err) {
      showToast('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    api.get('/api/portfolio').then(r => setPortfolios(r.data)).catch(() => {});
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (!searchRunning) return;
    const interval = setInterval(async () => {
      const res = await api.get(`/api/leads/search/${searchRunning}`);
      if (res.data.status === 'completed') {
        showToast(`✅ Found ${res.data.leads_found} leads!`);
        setSearchRunning(null);
        fetchLeads();
      } else if (res.data.status === 'failed') {
        showToast('Search failed. Check your Google Maps API key.');
        setSearchRunning(null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [searchRunning]);

  const draftAll = async () => {
    setDrafting(true);
    try {
      const res = await api.post('/api/leads/draft-all', {
        portfolioId: selectedPortfolio || undefined,
        channel
      });
      showToast(`✅ ${res.data.drafted} messages drafted!`);
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.error || 'Draft failed');
    } finally {
      setDrafting(false);
    }
  };

  const deleteLead = async (id) => {
    await api.delete(`/api/leads/${id}`);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const statusColors = { found: 'dim', pending_review: 'blue', approved: 'gold', sent: 'green', replied: 'purple' };

  return (
    <div style={{ padding: 32 }} className="fade-in">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--gold)',
          padding: '12px 20px', borderRadius: 8, color: 'var(--text)', fontSize: 14
        }}>{toast}</div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Leads</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>{total} total businesses found without websites</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={channel} onChange={e => setChannel(e.target.value)} style={selectStyle}>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <select value={selectedPortfolio} onChange={e => setSelectedPortfolio(e.target.value)} style={selectStyle}>
            <option value="">No portfolio</option>
            {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={draftAll} disabled={drafting} style={btnGold}>
            {drafting ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000' }} /> Drafting...</> : '◈ Draft Messages for New Leads'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Status</option>
          <option value="found">New</option>
          <option value="pending_review">Pending Review</option>
          <option value="sent">Sent</option>
          <option value="replied">Replied</option>
        </select>
        <input
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ ...selectStyle, minWidth: 200 }}
        />
      </div>

      {searchRunning && (
        <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gold)', fontSize: 13 }}>
          <div className="spinner" style={{ width: 14, height: 14 }} />
          Search in progress — finding businesses...
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : leads.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
            No leads found. Go to AI Chat to start a search.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Business', 'Category', 'Phone', 'Location', 'Rating', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>{lead.business_name}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text-dim)', fontSize: 12 }}>{lead.category}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>{lead.phone || '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text-dim)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.city}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 12 }}>{lead.rating ? `★ ${lead.rating}` : '—'}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span className={`badge badge-${statusColors[lead.status] || 'dim'}`}>{lead.status}</span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button onClick={() => deleteLead(lead.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const selectStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '8px 12px',
  color: 'var(--text)', fontSize: 13, outline: 'none'
};
const btnGold = {
  background: 'var(--gold)', color: '#000', border: 'none',
  padding: '8px 16px', borderRadius: 'var(--radius)',
  fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
};

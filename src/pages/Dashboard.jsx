import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StatCard = ({ label, value, color = 'var(--text)', sub }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '20px 24px', flex: 1
  }}>
    <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: 'var(--mono)' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [searches, setSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/leads/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/api/leads?limit=5&status=found').then(r => setSearches(r.data.leads || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 1000 }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Welcome back. Here's your lead pipeline overview.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total Leads" value={stats?.total} color="var(--text)" />
        <StatCard label="New Leads" value={stats?.new_leads} color="var(--gold)" sub="Need drafting" />
        <StatCard label="Pending Review" value={stats?.pending} color="var(--blue)" sub="Awaiting approval" />
        <StatCard label="Sent" value={stats?.sent} color="var(--green)" sub="Messages sent" />
        <StatCard label="Replied" value={stats?.replied} color="#a78bfa" sub="Interested clients" />
      </div>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '+ Find New Leads', path: '/chat', color: 'var(--gold)', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.3)' },
            { label: '◈ Review Messages', path: '/outreach', color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
            { label: '◧ Upload Portfolio', path: '/portfolio', color: 'var(--green)', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
          ].map(({ label, path, color, bg, border }) => (
            <button key={path} onClick={() => navigate(path)} style={{
              background: bg, border: `1px solid ${border}`,
              color, padding: '10px 18px', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: 13, transition: 'all 0.15s'
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Leads</h2>
        {searches.length === 0 ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '40px', textAlign: 'center', color: 'var(--text-dim)'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No leads yet</div>
            <div style={{ fontSize: 13 }}>Go to AI Chat and say "Search for salons in Abuja" to get started</div>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Business', 'Category', 'Location', 'Rating', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searches.map((lead, i) => (
                  <tr key={lead.id} style={{ borderBottom: i < searches.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{lead.business_name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>{lead.category}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: 12 }}>{lead.city}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--gold)', fontFamily: 'var(--mono)' }}>{lead.rating ? `★ ${lead.rating}` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${lead.status === 'sent' ? 'green' : lead.status === 'pending_review' ? 'blue' : 'dim'}`}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

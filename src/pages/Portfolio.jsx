import { useEffect, useState } from 'react';
import api from '../api';

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', canvaLink: '', tags: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchPortfolios = async () => {
    try {
      const res = await api.get('/api/portfolio');
      setPortfolios(res.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleSave = async () => {
    if (!form.name) return showToast('Portfolio name is required');
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('canvaLink', form.canvaLink);
      data.append('tags', form.tags);
      if (file) data.append('portfolio', file);

      await api.post('/api/portfolio', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('✅ Portfolio saved!');
      setShowForm(false);
      setForm({ name: '', description: '', canvaLink: '', tags: '' });
      setFile(null);
      fetchPortfolios();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deletePortfolio = async (id) => {
    await api.delete(`/api/portfolio/${id}`);
    setPortfolios(prev => prev.filter(p => p.id !== id));
    showToast('Deleted');
  };

  return (
    <div style={{ padding: 32 }} className="fade-in">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--gold)',
          padding: '12px 20px', borderRadius: 8, color: 'var(--text)', fontSize: 14
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Portfolio</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Manage files attached to your outreach messages</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnGold}>
          {showForm ? '✕ Cancel' : '+ Add Portfolio'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 24, marginBottom: 20
        }} className="fade-in">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add Portfolio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Portfolio Name *</label>
              <input placeholder="e.g. Salon Portfolio 2025" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input placeholder="e.g. salons, general, events" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Canva Link</label>
              <input placeholder="https://www.canva.com/design/..." value={form.canvaLink} onChange={e => setForm({ ...form, canvaLink: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description (optional)</label>
              <input placeholder="What is this portfolio for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Upload PDF File (optional)</label>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 8, padding: '20px',
                textAlign: 'center', cursor: 'pointer'
              }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" accept=".pdf,image/*" style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div style={{ color: 'var(--green)', fontWeight: 600 }}>📎 {file.name}</div>
                ) : (
                  <div style={{ color: 'var(--text-dim)' }}>Click to upload PDF or images</div>
                )}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ ...btnGold, marginTop: 16 }}>
            {saving ? 'Saving...' : '✓ Save Portfolio'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : portfolios.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>◧</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No portfolios yet</div>
          <div style={{ fontSize: 13 }}>Add your Canva link or upload a PDF above</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {portfolios.map(p => (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                <button onClick={() => deletePortfolio(p.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              {p.description && <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>{p.description}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.canva_link && (
                  <a href={p.canva_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--gold)' }}>
                    🔗 Canva Link
                  </a>
                )}
                {p.file_path && (
                  <div style={{ fontSize: 12, color: 'var(--green)' }}>📎 PDF attached</div>
                )}
              </div>
              {p.tags?.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.tags.map(tag => (
                    <span key={tag} className="badge badge-dim" style={{ fontSize: 10 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                Added {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' };
const inputStyle = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%' };
const btnGold = { background: 'var(--gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };

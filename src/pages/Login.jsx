import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) return setError('Fill in all fields');
    setLoading(true); setError('');
    try {
      if (mode === 'setup') {
        await api.post('/api/auth/setup', { username, password });
      }
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(245,166,35,0.04) 0%, transparent 60%)'
    }}>
      <div className="fade-in" style={{
        width: 380, padding: 40,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>LeadGen</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>Abuja.io</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 6, fontSize: 13 }}>
            {mode === 'login' ? 'Sign in to your dashboard' : 'Create your admin account'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />

          {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: 'var(--gold)', color: '#000', border: 'none',
              padding: '12px', borderRadius: 'var(--radius)',
              fontWeight: 700, fontSize: 14, marginTop: 4,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading && <div className="spinner" style={{ borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.2)' }} />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={() => setMode(mode === 'login' ? 'setup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12 }}
          >
            {mode === 'login' ? 'First time? Create admin account →' : '← Back to login'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '11px 14px',
  color: 'var(--text)', fontSize: 14, outline: 'none', width: '100%'
};

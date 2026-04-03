import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/leads', label: 'Leads', icon: '◎' },
  { to: '/outreach', label: 'Outreach', icon: '◈' },
  { to: '/portfolio', label: 'Portfolio', icon: '◧' },
  { to: '/chat', label: 'AI Chat', icon: '◉' },
  { to: '/settings', label: 'Settings', icon: '◌' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>LeadGen</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>Abuja.io</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 'var(--radius)',
              color: isActive ? 'var(--gold)' : 'var(--text-dim)',
              background: isActive ? 'rgba(245,166,35,0.08)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 13,
              borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent'
            })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
            Logged in as <span style={{ color: 'var(--text)' }}>{user?.username}</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 12, width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

export default function DashboardLayout() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  // Modern styling for the sidebar links
  const getLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    margin: '4px 0',
    borderRadius: '14px',
    color: isActive ? '#fff' : '#94A3B8',
    background: isActive ? 'linear-gradient(135deg, rgba(253, 93, 115, 0.15), rgba(225, 29, 72, 0.15))' : 'transparent',
    border: '1px solid',
    borderColor: isActive ? 'rgba(253, 93, 115, 0.3)' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 4px 15px rgba(225, 29, 72, 0.1)' : 'none',
    position: 'relative',
    overflow: 'hidden'
  });

  return (
    <div className="dashboard-shell" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', backgroundColor: '#0f1015' }}>
      <aside 
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          backgroundColor: '#12121c',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
          zIndex: 100,
        }}
        aria-label="Sidebar navigation"
      >
        <div style={{ marginBottom: '40px', padding: '0 10px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            fontWeight: '800', 
            background: 'linear-gradient(to right, #FD5D73, #E11D48)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            SLIIT's Got Talent
          </h1>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>
            Admin Portal
          </span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isAdmin ? (
            <>
              <NavLink 
                to="/dashboard/manage" 
                style={getLinkStyle}
                onMouseEnter={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Manage
              </NavLink>

              <NavLink 
                to="/dashboard/categories" 
                style={getLinkStyle}
                onMouseEnter={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Categories
              </NavLink>

              <NavLink 
                to="/dashboard/countdown" 
                style={getLinkStyle}
                onMouseEnter={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Countdown
              </NavLink>
            </>
          ) : null}

          <NavLink 
            to="/dashboard/settings" 
            style={getLinkStyle}
            onMouseEnter={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if(!e.currentTarget.style.background.includes('gradient')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </NavLink>
        </nav>

        <div style={{ 
          marginTop: 'auto', 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '16px', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6B6B, #48DBFB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
          }}>
            {(user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'Guest User'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'capitalize' }}>
              {user?.role || 'student'}
            </span>
          </div>
        </div>
      </aside>

      <main style={{ padding: '40px', minWidth: 0, overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}

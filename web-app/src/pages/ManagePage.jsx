import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function ManagePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTalentFilter, setActiveTalentFilter] = useState('All');

  const fetchContestants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get({ path: '/contestants/admin', token });
      setContestants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error fetching contestants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContestants();
  }, [token]);

  const handleAction = async (id, status) => {
    try {
      await api.put({ path: `/contestants/${id}`, token, body: { status } });
      setContestants(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    // Adding a more modern confirmation box using window.confirm (ideally, custom modal)
    if (!window.confirm('Are you sure you want to completely remove this contestant? This action cannot be reversed.')) return;
    try {
      await api.del({ path: `/contestants/${id}`, token });
      setContestants(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting contestant');
    }
  };

  // Derive unique talents for filter dropdown
  const availableTalents = ['All', ...new Set(contestants.map(c => c.talentType).filter(Boolean))];

  // Apply filters
  const filteredContestants = contestants.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.universityId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTalent = activeTalentFilter === 'All' || c.talentType === activeTalentFilter;
    return matchesSearch && matchesTalent;
  });

  const pending = filteredContestants.filter(c => (c.status || '').toLowerCase() === 'pending' || !c.status);
  const rejected = filteredContestants.filter(c => (c.status || '').toLowerCase() === 'rejected');
  const allNonRejected = filteredContestants.filter(c => (c.status || '').toLowerCase() === 'approved');

  const renderRow = (c, options = {}) => {
    const status = (c.status || 'pending').toLowerCase();
    const showRemarks = Boolean(options.showRemarks);
    const initials = (c.name || '?').substring(0, 2).toUpperCase();

    const getStatusStyles = (status) => {
      switch (status) {
        case 'approved':
          return { bg: 'rgba(46, 204, 113, 0.12)', color: '#4ade80', border: '1px solid rgba(46, 204, 113, 0.25)', glow: 'rgba(46, 204, 113, 0.05)' };
        case 'rejected':
          return { bg: 'rgba(255, 118, 117, 0.12)', color: '#ff7675', border: '1px solid rgba(255, 118, 117, 0.25)', glow: 'rgba(255, 118, 117, 0.05)' };
        default:
          return { bg: 'rgba(253, 203, 110, 0.12)', color: '#fdcb6e', border: '1px solid rgba(253, 203, 110, 0.25)', glow: 'rgba(253, 203, 110, 0.05)' };
      }
    };

    const statusObj = getStatusStyles(status);

    return (
      <div
        key={c._id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#13131c',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          borderLeft: `4px solid ${statusObj.color}`,
          padding: '24px',
          marginBottom: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 8px 20px rgba(0, 0, 0, 0.2), 0 0 20px ${statusObj.glow}`,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(253,93,115,0.8), rgba(225,29,72,0.8))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', color: '#fff',
              boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)', flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: '0', fontSize: '1.25rem', color: '#fff', fontWeight: '700', letterSpacing: '-0.3px' }}>
                {c.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  ID: {c.universityId?.toUpperCase()}
                </span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ 
                  color: '#E2E8F0', 
                  fontSize: '0.85rem', 
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span style={{ fontWeight: '500' , textTransform: 'capitalize'}}>{c.talentType}</span>
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '6px 14px',
              borderRadius: '8px',
              background: statusObj.bg,
              color: statusObj.color,
              border: statusObj.border,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {status}
            </span>

            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => navigate(`/dashboard/review/${c._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: 'rgba(255, 255, 255, 0.05)', color: '#e2e8f0', 
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#e2e8f0'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Details
              </button>

              {status !== 'approved' && (
                <button 
                  onClick={() => handleAction(c._id, 'approved')} 
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'rgba(46, 204, 113, 0.15)', color: '#4ade80',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2ecc71'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(46, 204, 113, 0.15)'; e.currentTarget.style.color = '#4ade80'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Approve
                </button>
              )}

              {status !== 'rejected' && (
                <button 
                  onClick={() => handleAction(c._id, 'rejected')} 
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'rgba(255, 118, 117, 0.15)', color: '#ff7675',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ff7675'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 118, 117, 0.15)'; e.currentTarget.style.color = '#ff7675'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Reject
                </button>
              )}

              <button 
                onClick={() => handleDelete(c._id)} 
                title="Delete Contestant Forever"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px', borderRadius: '8px', border: 'none',
                  background: 'transparent', color: '#64748B',
                  cursor: 'pointer', transition: 'all 0.2s ease', marginLeft: '4px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'; e.currentTarget.style.color = '#ff4757'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
        </div>

        {showRemarks && c.remarks && (
          <div style={{ 
            marginTop: '20px',
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 118, 117, 0.05)',
            borderLeft: '3px solid #ff7675',
            borderRadius: '0 8px 8px 0',
            color: '#CBD5E1',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            display: 'flex',
            gap: '10px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7675" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <strong style={{ color: '#ff7675', marginRight: '6px', display: 'block', marginBottom: '4px' }}>Reason for rejection:</strong> 
              {c.remarks}
            </div>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, count, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '700' }}>{title}</h3>
      <span style={{
        background: color,
        color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', padding: '2px 10px', borderRadius: '20px'
      }}>
        {count}
      </span>
    </div>
  );

  return (
    <div style={{ width: '100%', padding: '10px 0', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'linear-gradient(to right, rgba(253, 93, 115, 0.1), transparent)', padding: '24px 30px', borderRadius: '20px', border: '1px solid rgba(253, 93, 115, 0.2)' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #FD5D73, #E11D48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Contestant Management</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Admin Dashboard Control Center
          </p>
        </div>
        <button 
          onClick={fetchContestants} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)', 
            background: 'rgba(255, 255, 255, 0.05)', color: '#fff', 
            cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 118, 117, 0.1)', border: '1px solid rgba(255, 118, 117, 0.4)', color: '#ff7675', padding: '16px 20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      {/* Filters and Search Bar Section */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by Name or University ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 20px 14px 44px', borderRadius: '12px', boxSizing: 'border-box',
              border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-card)', color: '#fff', fontSize: '0.95rem'
            }}
          />
        </div>
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <select 
            value={activeTalentFilter}
            onChange={(e) => setActiveTalentFilter(e.target.value)}
            style={{
              padding: '14px 40px 14px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'var(--bg-card)', color: '#fff', fontSize: '0.95rem', appearance: 'none', cursor: 'pointer', minWidth: '180px'
            }}
          >
            {availableTalents.map(t => (
              <option key={t} value={t} style={{ color: '#fff', background: '#1c1c28' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '1.2rem', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(253, 93, 115, 0.3)', borderTopColor: '#FD5D73', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          Loading Contestants Data...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          
          <section>
            <SectionHeader title="Pending Approvals" count={pending.length} color="#fdcb6e" />
            <div style={{ minHeight: pending.length ? 'auto' : '100px' }}>
              {pending.length ? pending.map(c => renderRow(c)) : (
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  No pending requests waiting for your review.
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeader title="Active & Approved" count={allNonRejected.length} color="#2ecc71" />
            <div>
              {allNonRejected.length ? allNonRejected.map(c => renderRow(c)) : (
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  No approved contestants yet.
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeader title="Rejected Applications" count={rejected.length} color="#ff7675" />
            <div>
              {rejected.length ? rejected.map((c) => renderRow(c, { showRemarks: true })) : (
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                  No rejected applications.
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

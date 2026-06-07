import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

function prettyStatus(status) {
  const raw = String(status || '').toLowerCase();
  if (raw === 'approved') return 'Approved';
  if (raw === 'rejected') return 'Rejected';
  return 'Pending Review';
}

function statusTheme(status) {
  const raw = String(status || '').toLowerCase();
  if (raw === 'approved') {
    return {
      badge: { background: 'rgba(34,197,94,0.18)', color: '#86efac', border: '1px solid rgba(34,197,94,0.45)' },
      title: 'Your application is approved',
      subtitle: 'Great news. Your profile has passed review and is ready for the next stage.'
    };
  }

  if (raw === 'rejected') {
    return {
      badge: { background: 'rgba(248,113,113,0.2)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.45)' },
      title: 'Your application was rejected',
      subtitle: 'You can review the remark and submit a corrected re-application.'
    };
  }

  return {
    badge: { background: 'rgba(56,189,248,0.2)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.45)' },
    title: 'Your application is under review',
    subtitle: 'The organizers are reviewing your submission. Check back soon for updates.'
  };
}

export default function ApplicationStatusPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get({ path: '/contestants/my-application', token });
        if (!cancelled) {
          setApplication(res?.hasApplication ? res.data : null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load application status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const theme = useMemo(() => statusTheme(application?.status), [application?.status]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Loading Status</h2>
          <p style={styles.subtitle}>Checking your latest contestant application.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Unable To Load</h2>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/')}>
            Back To Home
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>No Application Found</h2>
          <p style={styles.subtitle}>You have not submitted a contestant application yet.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
            Apply Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.statusBadge, ...theme.badge }}>{prettyStatus(application.status)}</div>
        <h2 style={styles.title}>{theme.title}</h2>
        <p style={styles.subtitle}>{theme.subtitle}</p>

        <div style={styles.detailGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Name</span>
            <span style={styles.detailValue}>{application.name}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Student ID</span>
            <span style={styles.detailValue}>{application.universityId}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Category</span>
            <span style={styles.detailValue}>{application.talentType || '-'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Year / Semester</span>
            <span style={styles.detailValue}>{`${application.year || '-'} / ${application.semester || '-'}`}</span>
          </div>
        </div>

        {application.remarks ? (
          <div style={styles.remarksBox}>
            <p style={styles.remarksTitle}>Reviewer Remark</p>
            <p style={styles.remarksText}>{application.remarks}</p>
          </div>
        ) : null}

        <div style={styles.actionRow}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/')}>
            Back To Home
          </button>

          {application.status === 'rejected' ? (
            <button
              style={styles.primaryBtn}
              onClick={() => navigate('/register', { state: { reapply: true, prefill: application } })}
            >
              Re-Apply
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'radial-gradient(circle at 15% 10%, #12263a 0%, #0a101b 45%, #05070c 100%)',
    fontFamily: "'Sora', sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    backdropFilter: 'blur(18px)',
    padding: '30px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.45)'
  },
  statusBadge: {
    display: 'inline-flex',
    width: 'fit-content',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  title: {
    color: '#f8fafc',
    margin: '12px 0 6px 0',
    fontSize: '1.8rem'
  },
  subtitle: {
    color: '#b9c9da',
    margin: '0 0 20px 0',
    lineHeight: 1.6
  },
  errorText: {
    color: '#fca5a5',
    margin: '0 0 16px 0'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginBottom: '18px'
  },
  detailItem: {
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailLabel: {
    color: '#8fa2b7',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 700
  },
  detailValue: {
    color: '#f1f5f9',
    fontWeight: 600
  },
  remarksBox: {
    border: '1px solid rgba(251,191,36,0.35)',
    background: 'rgba(120,53,15,0.18)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '18px'
  },
  remarksTitle: {
    margin: '0 0 6px 0',
    color: '#fde68a',
    fontWeight: 700,
    fontSize: '0.86rem'
  },
  remarksText: {
    margin: 0,
    color: '#fef3c7',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(90deg, #06b6d4, #f97316)',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryBtn: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.22)',
    background: 'rgba(255,255,255,0.04)',
    color: '#dbe5ef',
    fontWeight: 700,
    cursor: 'pointer'
  }
};

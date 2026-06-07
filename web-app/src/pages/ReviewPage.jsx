import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api, toServerAssetUrl } from '../services/apiClient.js';

export default function ReviewPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [contestant, setContestant] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadContestant() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get({ path: `/contestants/admin/${id}`, token });
        if (!cancelled) {
          setContestant(data || null);
          setRemarks(data?.remarks || '');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load contestant details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token && id) loadContestant();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const statusColor = useMemo(() => {
    const status = (contestant?.status || '').toLowerCase();
    if (status === 'approved') return '#2ecc71';
    if (status === 'rejected') return '#ff7675';
    return '#fdcb6e';
  }, [contestant?.status]);

  const imageUrl = useMemo(() => toServerAssetUrl(contestant?.imageUrl), [contestant?.imageUrl]);
  const videoUrl = useMemo(() => toServerAssetUrl(contestant?.videoUrl), [contestant?.videoUrl]);

  async function saveReview(nextStatus) {
    if (!contestant?._id) return;
    setSaving(true);
    setError('');
    setMessage('');

    const body = {
      remarks: remarks.trim()
    };

    if (nextStatus) body.status = nextStatus;

    try {
      const res = await api.put({ path: `/contestants/${contestant._id}`, token, body });
      const updated = res?.data || { ...contestant, ...body };
      setContestant(updated);
      setRemarks(updated.remarks || remarks);
      setMessage(nextStatus ? `Contestant ${nextStatus}.` : 'Remarks saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save review.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading review details...</div>;
  }

  if (error && !contestant) {
    return (
      <div>
        <p style={{ color: '#ff7675' }}>{error}</p>
        <button onClick={() => navigate('/dashboard/manage')} style={styles.secondaryBtn}>Back to Manage</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Review Contestant</h2>
          <p style={styles.subtitle}>Check details, write remarks, and approve/reject the request.</p>
        </div>
        <button onClick={() => navigate('/dashboard/manage')} style={styles.secondaryBtn}>Back</button>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {message && <div style={styles.successBanner}>{message}</div>}

      <div style={styles.card}>
        <div style={styles.mediaColumn}>
          <div style={styles.mediaCard}>
            <p style={styles.mediaLabel}>Profile Image</p>
            {imageUrl ? <img src={imageUrl} alt={contestant?.name || 'Contestant'} style={styles.image} /> : <div style={styles.mediaPlaceholder}>No image uploaded</div>}
          </div>

          <div style={styles.mediaCard}>
            <p style={styles.mediaLabel}>Performance Video</p>
            {videoUrl ? <video src={videoUrl} controls style={styles.video} /> : <div style={styles.mediaPlaceholder}>No video uploaded</div>}
          </div>
        </div>

        <div style={styles.detailsColumn}>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Name</span><span style={styles.detailValue}>{contestant?.name || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Student ID</span><span style={styles.detailValue}>{contestant?.universityId || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Email</span><span style={styles.detailValue}>{contestant?.email || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Mobile</span><span style={styles.detailValue}>{contestant?.mobileNumber || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Year</span><span style={styles.detailValue}>{contestant?.year || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Semester</span><span style={styles.detailValue}>{contestant?.semester || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Category</span><span style={styles.detailValue}>{contestant?.talentType || '-'}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Status</span><span style={{ ...styles.detailValue, color: statusColor, fontWeight: 700 }}>{(contestant?.status || 'pending').toUpperCase()}</span></div>
          </div>

          <div style={styles.bioBlock}>
            <p style={styles.detailLabel}>Short Bio</p>
            <p style={styles.bioText}>{contestant?.description || 'No description provided.'}</p>
          </div>

          <div style={styles.remarksBlock}>
            <label htmlFor="remarks" style={styles.remarksLabel}>Remarks</label>
            <textarea
              id="remarks"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Write your review remarks here..."
              style={styles.textarea}
            />
          </div>

          <div style={styles.actionRow}>
            <button disabled={saving} onClick={() => saveReview()} style={styles.secondaryBtn}>Save Remarks</button>
            <button disabled={saving} onClick={() => saveReview('approved')} style={styles.approveBtn}>Approve</button>
            <button disabled={saving} onClick={() => saveReview('rejected')} style={styles.rejectBtn}>Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  title: {
    margin: 0
  },
  subtitle: {
    margin: '6px 0 0 0',
    color: 'var(--text-muted)'
  },
  card: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 420px) 1fr',
    gap: '16px'
  },
  mediaColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  mediaCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px'
  },
  mediaLabel: {
    margin: '0 0 8px 0',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  image: {
    width: '100%',
    maxHeight: '240px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  video: {
    width: '100%',
    borderRadius: '10px',
    backgroundColor: '#0b0b0d'
  },
  mediaPlaceholder: {
    minHeight: '120px',
    border: '1px dashed var(--border)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  detailsColumn: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '10px'
  },
  detailLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  detailValue: {
    color: '#fff'
  },
  bioBlock: {
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px'
  },
  bioText: {
    margin: '6px 0 0 0',
    color: '#fff',
    lineHeight: 1.5
  },
  remarksBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  remarksLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  textarea: {
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#fff',
    padding: '10px',
    resize: 'vertical',
    minHeight: '100px'
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  secondaryBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer'
  },
  approveBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    background: '#2ecc71',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700
  },
  rejectBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    background: '#ff7675',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700
  },
  errorBanner: {
    color: '#ff7675'
  },
  successBanner: {
    color: '#2ecc71'
  }
};

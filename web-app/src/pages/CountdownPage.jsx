import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function CountdownPage() {
  const { token } = useAuth();
  const [countdownEnd, setCountdownEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let timer;
    if (countdownEnd) {
      const updateTimer = () => {
        const target = new Date(countdownEnd).getTime();
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff <= 0) {
          setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
          clearInterval(timer);
        } else {
          setTimeLeft({
            d: Math.floor(diff / (1000 * 60 * 60 * 24)),
            h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            s: Math.floor((diff % (1000 * 60)) / 1000),
            expired: false
          });
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(timer);
  }, [countdownEnd]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await api.get({ path: '/settings', token });
      if (data && data.countdownEnd) {
        const d = new Date(data.countdownEnd);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setCountdownEnd(d.toISOString().slice(0, 16));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(newCountdown) {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put({
        path: '/settings',
        token,
        body: { countdownEnd: newCountdown ? new Date(newCountdown).toISOString() : null }
      });
      setMsg({ type: 'success', text: 'Countdown updated successfully!' }); 
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }

  const handleSaveCountdown = (e) => {
    e.preventDefault();
    saveSettings(countdownEnd);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ flex: 1 }}>
          <h2 style={styles.pageTitle}>Voting Countdown</h2>
          <p style={styles.pageSubtitle}>Set the end date and time for the live voting session</p>
        </div>
      </header>

      {/* Alert Messages */}
      {msg.text && (
        <div style={msg.type === 'error' ? styles.alertError : styles.alertSuccess}>
           {msg.type === 'success' ? '✅ ' : '⚠️ '} {msg.text}
        </div>
      )}

      {/* Main Countdown Card */}
      {timeLeft && (
        <div style={styles.liveClockContainer}>
          <div style={styles.liveClockTitle}>
            {timeLeft.expired ? 'Voting Has Ended' : 'Time Remaining to Vote'}
          </div>
          <div style={styles.clockRow}>
            <div style={styles.clockBox}>
              <div style={styles.clockValue}>{String(timeLeft.d).padStart(2, '0')}</div>
              <div style={styles.clockLabel}>Days</div>
            </div>
            <div style={styles.clockDivider}>:</div>
            <div style={styles.clockBox}>
              <div style={styles.clockValue}>{String(timeLeft.h).padStart(2, '0')}</div>
              <div style={styles.clockLabel}>Hours</div>
            </div>
            <div style={styles.clockDivider}>:</div>
            <div style={styles.clockBox}>
              <div style={styles.clockValue}>{String(timeLeft.m).padStart(2, '0')}</div>
              <div style={styles.clockLabel}>Minutes</div>
            </div>
            <div style={styles.clockDivider}>:</div>
            <div style={styles.clockBox}>
              <div style={styles.clockValue}>{String(timeLeft.s).padStart(2, '0')}</div>
              <div style={styles.clockLabel}>Seconds</div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSaveCountdown} style={styles.countdownForm}>      
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={styles.inputLabel}>End Date & Time</label>
            <div style={styles.inputWrapper}>
              <input
                type="datetime-local"
                value={countdownEnd}
                onChange={(e) => setCountdownEnd(e.target.value)}
                onClick={(e) => {
                  try {
                    if (e.target.showPicker) {
                      e.target.showPicker();
                    }
                  } catch (err) {
                    console.log(err);
                  }
                }}
                style={styles.inputField}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" disabled={saving || loading} style={styles.actionBtn}>   
              {saving ? 'Saving...' : 'Save Timer'}
            </button>
            <button
              type="button"
              onClick={() => {
                if(window.confirm('Clear the active countdown timer?')) {
                    setCountdownEnd('');
                    saveSettings('');
                }
              }}
              style={styles.clearBtn}
              disabled={saving || !countdownEnd || loading}
            >
              Clear Timer
            </button>
          </div>
        </form>
      </div>
      
      {/* Required tiny CSS reset for browser calendar picker icon */}
      <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.6;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#f8fafc',
  },
  liveClockContainer: {
    background: 'linear-gradient(145deg, rgba(225, 29, 72, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    border: '1px solid rgba(253, 93, 115, 0.2)',
    borderRadius: '24px',
    padding: '3rem 2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  liveClockTitle: {
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#FD5D73',
    fontWeight: '700',
    marginBottom: '1.5rem',
  },
  clockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  clockBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    minWidth: '80px',
  },
  clockValue: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'monospace',
  },
  clockLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.75rem',
    fontWeight: '600',
  },
  clockDivider: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: '2rem',
  },
  header: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '400',
  },
  
  card: { 
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  countdownForm: { display: 'flex', flexDirection: 'column' },
  
  inputLabel: { display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem', letterSpacing: '0.5px' },
  
  inputWrapper: { position: 'relative', width: '100%' },
  
  inputField: { 
      width: '100%',
      padding: '16px 20px', 
      backgroundColor: 'rgba(15, 23, 42, 0.6)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px', 
      color: '#ffffff', 
      fontSize: '1.05rem', 
      outline: 'none', 
      boxSizing: 'border-box',
      fontFamily: 'monospace',
      transition: 'border-color 0.2s, background-color 0.2s',
      colorScheme: 'dark'
  },
  
  actionBtn: { 
      padding: '12px 30px', 
      background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)', 
      color: '#fff', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '1rem', 
      fontWeight: '600', 
      cursor: 'pointer',
      transition: 'opacity 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  
  clearBtn: { 
      padding: '12px 24px', 
      backgroundColor: 'transparent', 
      color: '#94a3b8', 
      border: '1px solid rgba(148, 163, 184, 0.3)', 
      borderRadius: '12px', 
      fontSize: '1rem', 
      fontWeight: '500', 
      cursor: 'pointer',
      transition: 'background-color 0.2s, color 0.2s'
  },
  
  alertSuccess: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' },
  alertError: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' }
};

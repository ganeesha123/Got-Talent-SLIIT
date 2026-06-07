import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

function isSliitEmail(email) {
  return /@(my\.)?sliit\.lk$/i.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, isAuthed } = useAuth();

  const from = useMemo(() => location.state?.from?.pathname || '/vote', [location.state]);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (isAuthed) {
    return <Navigate to={from} replace />;
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    const cleanEmail = email.trim();
    if (!cleanEmail) return setError('Email required');
    if (!isSliitEmail(cleanEmail)) return setError('Use @sliit.lk or @my.sliit.lk email');

    setLoading(true);
    try {
      await api.post({ path: '/auth/login', body: { email: cleanEmail } });
      setStep(2);
      setInfo('OTP sent. Check your inbox (or server console in dev mode).');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    if (!cleanOtp) return setError('OTP required');

    setLoading(true);
    try {
      const res = await api.post({ path: '/auth/verify', body: { email: cleanEmail, otp: cleanOtp } });
      if (!res?.token || !res?.user) throw new Error(res?.message || 'Invalid OTP');
      setSession({ token: res.token, user: res.user });
      
      if (res.user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (res.user.role === 'judge') {
        navigate('/judge-dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Background ambient glows */}
      <div style={{...styles.ambientGlow, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)'}} />
      <div style={{...styles.ambientGlow, bottom: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)'}} />

      <div style={styles.card}>
        {/* Left Side: Branding / Visuals */}
        <div style={styles.leftPanel}>
          <div style={styles.brandOverlay}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={styles.brandTitle}>SLIIT'S GOT TALENT</h1>
              <span style={styles.badge}>Live Voting Platform</span>
            </div>
            <div>
              <h2 style={styles.visualTitle}>Bring the Spotlight<br/>to True Talent.</h2>
              <p style={styles.visualSubtitle}>
                Join the student community to vote fairly, securely, and shape the leaderboard in real-time. Only verified academic emails allowed.
              </p>
              
              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>✨</span> Live rankings with transparent vote counts
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🔒</span> OTP-verified secure student identity
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.featureIcon}>🎯</span> One vote per student to keep results fair
                </div>
              </div>
            </div>
            
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <div style={styles.statValue}>24/7</div>
                <div style={styles.statLabel}>Access</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>100%</div>
                <div style={styles.statLabel}>Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formContainer}>
            <div style={styles.stepIndicator}>{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</div>
            <h2 style={styles.formTitle}>{step === 1 ? 'Welcome Back' : 'Verify Identity'}</h2>
            <p style={styles.formSubtitle}>
              {step === 1 
                ? 'Sign in with your academic email to access the voting dashboard.' 
                : 'Enter the 6-digit verification code sent to your email.'}
            </p>

            {error && <div style={styles.alertError}>{error}</div>}
            {info && <div style={styles.alertInfo}>{info}</div>}

            {step === 1 ? (
              <form onSubmit={requestOtp} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Academic Email Address</label>
                  <input
                    type="email"
                    style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
                    placeholder="student@my.sliit.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <span style={styles.helperText}>Only @sliit.lk or @my.sliit.lk accepted.</span>
                </div>
                <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>
                  {loading ? 'Sending Verification...' : 'Continue with Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>One-Time Password</label>
                  <input
                    type="text"
                    style={{ ...styles.input, textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.25rem', fontWeight: 'bold' }}
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                  />
                  <span style={styles.helperText}>Code expires in 5 minutes. Enter it exactly as received.</span>
                </div>
                <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify and Sign In'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button type="button" style={styles.linkButton} onClick={() => { setStep(1); setOtp(''); setError(''); setInfo(''); }}>
                    &larr; Use a different email
                  </button>
                </div>
              </form>
            )}
            
            <div style={styles.footer}>
              Secured by SLIIT Academic Verification
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    backgroundImage: 'radial-gradient(circle at 50% -20%, #1c0e15 0%, #0a0a0f 70%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '2rem',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  },
  ambientGlow: {
    position: 'absolute',
    width: '70vw',
    height: '70vw',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '1100px',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    minHeight: '650px',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  leftPanel: {
    flex: '1.2',
    minWidth: '400px',
    background: 'linear-gradient(145deg, rgba(225, 29, 72, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3.5rem',
    color: '#fff',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)'
  },
  brandOverlay: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    gap: '2rem'
  },
  brandTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    margin: '0 0 0.75rem 0',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    backgroundColor: 'rgba(253, 93, 115, 0.1)',
    border: '1px solid rgba(253, 93, 115, 0.2)',
    color: '#FD5D73',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    letterSpacing: '0.05em',
    display: 'inline-block'
  },
  visualTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: 1.1,
    margin: '0 0 1.5rem 0',
    letterSpacing: '-0.03em',
    color: '#f8fafc'
  },
  visualSubtitle: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: '#94a3b8',
    margin: '0 0 2.5rem 0',
    maxWidth: '90%'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  featureItem: {
    fontSize: '0.95rem',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '1.25rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    marginRight: '0.75rem',
    fontSize: '1.25rem'
  },
  statsRow: {
    display: 'flex',
    gap: '3rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600'
  },
  rightPanel: {
    flex: '1',
    minWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
  stepIndicator: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#FD5D73',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1.5rem',
    display: 'inline-block',
    background: 'rgba(253, 93, 115, 0.1)',
    padding: '0.4rem 1rem',
    borderRadius: '999px'
  },
  formTitle: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.75rem 0',
    letterSpacing: '-0.02em',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: '#94a3b8',
    margin: '0 0 2.5rem 0',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1.05rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  helperText: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  button: {
    width: '100%',
    padding: '1.1rem 1.5rem',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '0.5rem',
    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.75rem',
    transition: 'color 0.2s ease',
  },
  alertError: {
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    borderRadius: '12px',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  alertInfo: {
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
    borderRadius: '12px',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  footer: {
    marginTop: '3rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#475569',
    fontWeight: '500'
  }
};


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [targetTime, setTargetTime] = useState(null);

  useEffect(() => {
    let active = true;
    api.get({ path: '/settings' })
      .then(res => {
        if (active && res?.countdownEnd) {
          setTargetTime(new Date(res.countdownEnd).getTime());
        }
      })
      .catch(err => console.error("Could not fetch countdown info", err));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!targetTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="countdown-widget">
      <div className="countdown-title">Time Remaining</div>
      <div className="countdown-values">
        {timeLeft.days > 0 && (
          <div className="time-box">
            <span className="time-num">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="time-label">Days</span>
          </div>
        )}
        <div className="time-box">
          <span className="time-num">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="time-label">Hours</span>
        </div>
        <div className="time-box">
          <span className="time-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="time-label">Minutes</span>
        </div>
        <div className="time-box">
          <span className="time-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="time-label">Seconds</span>
        </div>
      </div>
      {/* Huge fading check abstract shape mimicking the reference */}
      <div className="abstract-check">✓</div>
    </div>
  );
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  // Filter out the word 'admin' from the greeting to avoid confusion on the public page
  const rawPrefix = user?.email ? user.email.split('@')[0] : 'Student';
  const userName = rawPrefix.toLowerCase() === 'admin' ? 'SLIIT Voter' : rawPrefix;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        body { margin: 0; background-color: #f8f9fa; overscroll-behavior: none; }
        
        /* Navbar */
        .glass-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 5%;
          display: flex; align-items: center; justify-content: space-between;
          background: ${isScrolled ? 'rgba(10, 10, 15, 0.95)' : 'transparent'};
          backdrop-filter: ${isScrolled ? 'blur(10px)' : 'none'};
          border-bottom: ${isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'transparent'};
          transition: all 0.3s ease;
        }
        .nav-logo { color: #fff; font-weight: 600; font-size: 1.1rem; text-decoration: none; letter-spacing: 0.5px; }
        .nav-logo span { color: #888; margin: 0 10px; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-link { color: #d1d5db; text-decoration: none; font-weight: 500; font-size: 0.95rem; position: relative; }
        .nav-link.active { color: #fff; font-weight: 600; }
        .nav-link.active::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 100%; height: 2px; background: #fff; }
        .nav-link:hover { color: #fff; }
        .help-btn {
          border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 30px;
          padding: 8px 24px; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;
        }
        .help-btn:hover { background: rgba(255,255,255,0.1); }

        /* Dark Hero Background */
        .hero-section {
          position: relative;
          background: #0f1015 url('https://images.unsplash.com/photo-1540039155732-684735035727?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          padding: 180px 5% 150px;
          color: #fff;
        }
        .hero-section::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%);
        }
        
        .hero-content {
          position: relative; z-index: 10; max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px;
        }

        .hero-title-area { display: flex; align-items: flex-start; gap: 16px; }
        .huge-number { color: #FACC15; font-size: 8rem; font-weight: 900; line-height: 0.8; letter-spacing: -2px; }
        .hero-subtitle-area { display: flex; flex-direction: column; padding-top: 10px; }
        .rd-badge { color: #FACC15; font-size: 2.5rem; font-weight: 900; line-height: 1; margin-bottom: 5px; }
        .meeting-text { font-size: 1.5rem; font-weight: 400; line-height: 1.2; letter-spacing: 1px; color: #e2e8f0; text-transform: uppercase; }

        .countdown-widget {
          text-align: right; position: relative;
        }
        .countdown-title { color: #9ca3af; font-size: 1rem; margin-bottom: 12px; font-weight: 500; }
        .countdown-values { display: flex; gap: 20px; text-align: center; justify-content: flex-end; position: relative; z-index: 2; }
        .time-box { display: flex; flex-direction: column; align-items: center; }
        .time-num { font-size: 4.5rem; font-weight: 300; line-height: 1; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .time-label { font-size: 0.85rem; color: #9ca3af; text-transform: capitalize; margin-top: 5px; }
        
        .abstract-check {
          position: absolute; right: -20px; top: -40px; font-size: 14rem;
          color: rgba(59, 130, 246, 0.4); font-weight: bold; transform: rotate(-15deg);
          z-index: 1; pointer-events: none; line-height: 1;
        }

        /* Overlapping White Action Card */
        .card-container {
          position: relative; max-width: 1000px; margin: -80px auto 0; z-index: 20; padding: 0 5%;
        }
        .action-card {
          background: #ffffff; border-radius: 20px; padding: 40px 50px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); flex-wrap: wrap; gap: 30px;
        }
        .greeting-title { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0 0 8px 0; display: flex; alignItems: center; gap: 8px; }
        .greeting-sub { font-size: 1.1rem; color: #6b7280; margin: 0; font-weight: 400; }

        .vote-action-area { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .live-badge {
          display: flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.1);
          color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 14px;
          border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        }
        .live-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .blue-vote-btn {
          background: #2563EB; color: #fff; font-size: 1.2rem; font-weight: 600;
          padding: 16px 36px; border-radius: 40px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 12px; transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
        }
        .blue-vote-btn:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 15px 25px rgba(37, 99, 235, 0.3); }

        /* Lower section */
        .nominees-section {
          padding: 100px 5%; text-align: center; color: #111827;
        }
        .section-title { font-size: 2.2rem; font-weight: 700; margin: 0 0 12px 0; }
        .section-sub { font-size: 1.1rem; color: #6b7280; margin: 0; }
      `}</style>

      {/* Navbar directly matching reference */}
      <nav className="glass-nav">
        <Link to="/" className="nav-logo">Votify <span>|</span> SLIIT</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/vote" className="nav-link">Meet Contestants</Link>
          <Link to="/rankings" className="nav-link">Live Results</Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <button 
                onClick={() => { clearSession(); navigate('/', { replace: true }); }} 
                className="help-btn" 
                style={{cursor: 'pointer', background: 'transparent'}}
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="help-btn">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero match */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-title-area">
            <div className="huge-number">10</div>
            <div className="hero-subtitle-area">
              <div className="rd-badge">TH</div>
              <div className="meeting-text">ANNUAL<br/>SLIIT'S GOT<br/>TALENT</div>
            </div>
          </div>
          <CountdownTimer />
        </div>
      </div>

      {/* Overlapping Card */}
      <div className="card-container">
        <div className="action-card">
          <div>
            <h2 className="greeting-title">Hello {userName} <span style={{fontSize: '1.4rem'}}>👋</span></h2>
            <p className="greeting-sub">It's time to make your voice heard.</p>
          </div>
          <div className="vote-action-area">
            <Link 
              to={user ? "/vote" : "/login"} 
              state={{ from: { pathname: '/vote' } }} 
              className="blue-vote-btn"
            >
              Cast Your Vote Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE Voting is open now
            </div>
            {user ? (
              <Link to="/application-status" className="help-btn" style={{ color: '#111827', borderColor: '#d1d5db' }}>
                My Application
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="nominees-section">
        <h2 className="section-title">Meet the Performers</h2>
        <p className="section-sub">Get to know the contestant profiles & make an informed decision.</p>

        {/* Features / Categories Grid */}
        <div style={{ maxWidth: '1200px', margin: '40px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', textAlign: 'left' }}>
          
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
              🎤
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>Vocal Powerhouses</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6', margin: 0 }}>From emotional acoustics to powerful ballads. Discover the journey of soloists and bands competing to become SLIIT's most acclaimed vocalists.</p>
          </div>

          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
              💃
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>Exquisite Choreography</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6', margin: 0 }}>Watch crews battle it out. Expect high-energy routines, stunning costumes, and perfect synchronization on the main stage.</p>
          </div>

          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
              🎭
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>Variety & Magic</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6', margin: 0 }}>Prepare to be amazed by mind-bending magic tricks, unique instrumental performances, and breathtaking variety acts.</p>
          </div>

        </div>

        <Link to="/vote" style={{ display: 'inline-block', marginTop: '60px', color: '#2563EB', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid #2563EB', paddingBottom: '4px' }}>
          Explore all contestants →
        </Link>
      </div>

      {/* About Section */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 20px 0', color: '#111827', letterSpacing: '-1px' }}>
              What is SLIIT's Got Talent?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.8', marginBottom: '24px' }}>
              Organized by the Faculty of Engineering Students’ Community, <strong>SLIIT’s Got Talent</strong> brings together faculties, staff, and directors for an unforgettable night of music, dance, and sheer entertainment.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.8', marginBottom: '32px' }}>
              It is the most anticipated event of the year where the brightest undergraduates from across all faculties showcase their mind-blowing performances. You—the audience—have the ultimate power to crown the <strong>People's Choice Award</strong> winner using our real-time interactive voting platform.
            </p>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#111827', color: '#fff', padding: '14px 28px', borderRadius: '30px', fontWeight: '600', textDecoration: 'none' }}>
              Register your Talent
            </Link>
          </div>
          <div style={{ flex: '1 1 400px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop" alt="Concert Stage" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Modern Clean Footer */}
      <footer style={{ background: '#0f1015', color: '#9ca3af', padding: '60px 5% 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px', marginBottom: '40px' }}>
          <div style={{ maxWidth: '300px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 16px 0' }}>SLIIT's Got Talent</h3>
            <p style={{ margin: 0, lineHeight: '1.6' }}>The Official Voting & Event Platform. Brought to you by the Students' Community.</p>
          </div>
          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 16px 0', fontWeight: '600' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/vote" style={{ color: '#9ca3af', textDecoration: 'none' }}>Vote Now</Link>
                <Link to="/rankings" style={{ color: '#9ca3af', textDecoration: 'none' }}>Live Rankings</Link>
                <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Student Login</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 16px 0', fontWeight: '600' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="https://www.sliit.lk" style={{ color: '#9ca3af', textDecoration: 'none' }}>SLIIT Website</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} SLIIT's Got Talent. Final Year / Student Community Initiative. Not officially affiliated with SLIIT Administration.
        </div>
      </footer>
    </div>
  );
}

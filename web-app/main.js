// --- CONFIG ---
const API_BASE_URL = 'http://localhost:5000/api'; // Use localhost explicitly

// --- STATE MANAGEMENT ---
const root = document.getElementById('root');
let initialUser = null;
try {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('userData');
  if (token && userStr) initialUser = JSON.parse(userStr);
} catch (e) {
  console.error("Storage error:", e);
}

let state = {
  view: initialUser ? 'dashboard' : 'landing', 
  activeTab: 'vote', 
  step: 1, 
  user: initialUser,
  loading: false,
  error: '',
  info: '',
  contestants: [],
  leaderboard: [],
  adminContestants: [],
  hasVoted: initialUser?.isVoted || false,
};

function normalizeTab(tab) {
    if (!tab) return null;
    const allowed = { vote: true, rankings: true, manage: true, settings: true };
    return allowed[tab] ? tab : null;
}

function tabFromHash() {
    const hash = (window.location.hash || '').replace('#', '').trim();
    return normalizeTab(hash);
}

function setState(patch) {
  state = { ...state, ...patch };
  // Log for debugging
  console.log('State updated:', state);
  requestAnimationFrame(render);
}
// Make global immediately
window.setState = setState;

// --- API LAYER ---
const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  post: async (endpoint, body) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  put: async (endpoint, body) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  delete: async (endpoint) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// --- LOGIC ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email')?.value.trim();
    if (!email) return setState({ error: 'Email required' });
    
    // Validate
    if (!/@(my\.)?sliit\.lk$/.test(email)) return setState({ error: 'Use @sliit.lk email' });

    setState({ loading: true, error: '' });
    try {
        const res = await api.post('/auth/login', { email });
        // Assume success even if dev mode devOtp is returned
        setState({ step: 2, loading: false, info: 'OTP sent! Check your inbox (or console).' });
        root.dataset.email = email;
    } catch (err) {
        setState({ loading: false, error: err.message || 'Login failed' });
    }
}

async function handleVerify(e) {
    e.preventDefault();
    const otp = document.getElementById('otp')?.value.trim();
    const email = root.dataset.email;
    if (!otp) return setState({ error: 'OTP required' });

    setState({ loading: true, error: '' });
    try {
        const res = await api.post('/auth/verify', { email, otp });
        if (res.token) {
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('userData', JSON.stringify(res.user));
            setState({ 
                view: 'dashboard', 
                user: res.user, 
                hasVoted: res.user.isVoted,
                loading: false 
            });
        } else {
            setState({ loading: false, error: res.message || 'Invalid OTP' });
        }
    } catch (err) {
        setState({ loading: false, error: 'Verification failed' });
    }
}

async function handleVote(contestantId) {
    if (state.hasVoted) return alert('You have already voted!');
    if (!confirm('Confirm your vote? This cannot be undone.')) return;

    try {
        // Optimistic update
        setState({ hasVoted: true });
        
        const res = await api.post('/votes', { contestantId });
        if (res.success) {
            // Update local user data
            const updatedUser = { ...state.user, isVoted: true };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setState({ user: updatedUser, info: 'Vote cast successfully!' });
            fetchDataForTab('rankings'); // Refresh rankings
        } else {
            setState({ hasVoted: false, error: res.message }); // Revert
            alert(res.message);
        }
    } catch (err) {
        setState({ hasVoted: false, error: 'Vote failed' });
        console.error(err);
    }
}

async function fetchDataForTab(tab) {
    if (tab === 'vote') {
        // Fetch approved contestants
        try {
            const data = await api.get('/contestants'); // Public route
            if (Array.isArray(data)) setState({ contestants: data });
        } catch (e) { console.error(e); }
    } 
    else if (tab === 'rankings') {
        try {
            const res = await api.get('/votes/stats');
            if (res.success) setState({ leaderboard: res.data });
        } catch (e) { console.error(e); }
    }
    else if (tab === 'manage') {
        try {
            const data = await api.get('/contestants/admin');
            if (Array.isArray(data)) setState({ adminContestants: data });
        } catch (e) { console.error(e); }
    }
}

// --- RENDER HELPERS ---
const LoadingSpinner = () => `<div style="text-align:center; padding:40px; color:var(--text-muted)">Loading...</div>`;
const ErrorMessage = (msg) => msg ? `<div style="color:#ff7675; text-align:center; padding:10px; background:rgba(255,118,117,0.1); border-radius:8px; margin-bottom:15px;">${msg}</div>` : '';

// --- VIEWS ---

function renderLanding() {
    return `
      <div class="landing-page">
        <div class="mesh-bg"></div>
        <nav class="landing-nav">
          <div class="brand">Started From <span style="color:var(--primary)">Bottom</span></div>
          <div>
            <button class="btn-ghost" onclick="setState({view: 'register'})" style="margin-right:10px">Register Talent</button>
            <button class="btn-primary" onclick="setState({view: 'auth', step: 1})" style="width:auto">Sign In</button>
          </div>
        </nav>
        <header class="hero-section">
          <h1 class="hero-title">Discover the next<br><span>Campus Star</span></h1>
          <p style="color:var(--text-muted); max-width:600px; margin-bottom:40px; font-size:18px;">
            The ultimate platform for university talent. Watch performances, cast your secure vote, and crown the champion.
          </p>
          <div style="display:flex; gap:16px; justify-content:center;">
             <button class="btn-primary" style="width:auto; padding:16px 40px; font-size:18px;" onclick="setState({view: 'auth', step: 1})">Vote Now</button>
          </div>
        </header>
      </div>
    `;
}

function renderAuth() {
    const isStep1 = state.step === 1;
    return `
        <div class="app-shell">
            <div style="margin-bottom:40px; cursor:pointer" onclick="setState({view:'landing'})">← Back</div>
            <div class="glass-card" style="padding:40px;">
                <h1 style="font-size:32px; font-weight:800; margin-bottom:10px;">${isStep1 ? 'Welcome Back' : 'Verify Identity'}</h1>
                <p style="color:var(--text-muted); margin-bottom:30px;">${isStep1 ? 'Enter your academic email to proceed.' : 'Check your inbox for the 6-digit code.'}</p>
                
                ${ErrorMessage(state.error)}
                ${state.info ? `<div style="color:#55efc4; margin-bottom:15px; text-align:center">${state.info}</div>` : ''}

                <form onsubmit="${isStep1 ? 'handleLogin(event)' : 'handleVerify(event)'}">
                    ${isStep1 ? `
                        <div class="input-group">
                            <label class="input-label">EMAIL ADDRESS</label>
                            <input type="email" id="email" class="input-field" placeholder="itxxxxxxxx@my.sliit.lk" required autofocus>
                        </div>
                    ` : `
                        <div class="input-group">
                            <label class="input-label">ONE-TIME PASSWORD</label>
                            <input type="text" id="otp" class="input-field" placeholder="000 000" maxlength="6" required autofocus style="letter-spacing:4px; text-align:center; font-size:24px;">
                        </div>
                    `}
                    <button type="submit" class="btn-primary" ${state.loading ? 'disabled' : ''}>
                        ${state.loading ? 'Processing...' : isStep1 ? 'Continue' : 'Verify & Login'}
                    </button>
                </form>
                ${!isStep1 ? `<div style="text-align:center; margin-top:20px; font-size:12px; color:var(--text-muted); cursor:pointer" onclick="setState({step:1, error:''})">Change email address</div>` : ''}
            </div>
        </div>
    `;
}

function renderRegister() {
    return `
      <div class="app-shell" style="max-width:600px">
         <div style="margin-bottom:20px; cursor:pointer" onclick="setState({view:'landing'})">← Back</div>
         <div class="glass-card">
            <h2 style="margin-bottom:20px; font-size:24px;">Talent Registration</h2>
            <form id="reg-form" onsubmit="handleRegistration(event)">
               <div class="input-group"><label class="input-label">FULL NAME</label><input class="input-field" id="r-name" required></div>
               <div class="input-group"><label class="input-label">STUDENT ID</label><input class="input-field" id="r-id" required></div>
               <div class="input-group">
                  <label class="input-label">CATEGORY</label>
                  <select class="input-field" id="r-type" style="color:#000">
                    <option>Singing</option><option>Dancing</option><option>Band</option><option>Magic/Other</option>
                  </select>
               </div>
               <div class="input-group"><label class="input-label">VIDEO LINK (YouTube/Drive)</label><input class="input-field" id="r-video"></div>
               <div class="input-group"><label class="input-label">SHORT BIO</label><textarea class="input-field" id="r-bio" rows="3"></textarea></div>
               <button type="submit" class="btn-primary">Submit Application</button>
            </form>
         </div>
      </div>
    `;
}

// Separate function because it was too big
window.handleRegistration = async (e) => {
    e.preventDefault();
    const body = {
        name: document.getElementById('r-name').value,
        universityId: document.getElementById('r-id').value,
        talentType: document.getElementById('r-type').value,
        videoUrl: document.getElementById('r-video').value,
        description: document.getElementById('r-bio').value
    };
    try {
        await api.post('/contestants', body);
        alert('Registration submitted for approval!');
        setState({view: 'landing'});
    } catch(err) { alert('Error registering'); }
};

function renderDashboard() {
    const { user, activeTab, contestants, leaderboard, adminContestants, hasVoted } = state;
    const isAdmin = user?.role === 'admin';

    // Auto-fetch logic
    if (activeTab === 'vote' && contestants.length === 0) fetchDataForTab('vote');
    if (activeTab === 'rankings' && leaderboard.length === 0) fetchDataForTab('rankings');
    if (activeTab === 'manage' && isAdmin && adminContestants.length === 0) fetchDataForTab('manage');

    let content = '';

    // -- DASHBOARD CONTENT SWITCHER --
    if (activeTab === 'vote') {
        const list = contestants.map(c => `
            <div class="glass-card contestant-card">
                <div class="card-image-wrapper">
                    ${c.videoUrl && c.videoUrl.includes('youtube') 
                        ? `<img src="https://img.youtube.com/vi/${c.videoUrl.split('v=')[1]?.split('&')[0]}/hqdefault.jpg" style="width:100%; height:100%; object-fit:cover;">`
                        : `<div class="card-image-placeholder">${c.name.charAt(0)}</div>`
                    }
                    <div class="badge">${c.talentType}</div>
                </div>
                <h3 class="card-title">${c.name}</h3>
                <p class="card-desc">${c.description || 'No description provided.'}</p>
                <div style="margin-top:auto">
                    ${hasVoted 
                        ? `<button class="btn-primary btn-disabled" disabled>Voted</button>`
                        : `<button class="btn-primary" onclick="handleVote('${c._id}')">Vote for ${c.name.split(' ')[0]}</button>`
                    }
                </div>
            </div>
        `).join('');

        content = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">Live Voting</h2>
                    <p class="page-subtitle">Cast your vote for the most talented performer.</p>
                </div>
                ${hasVoted ? '<div style="background:rgba(46,204,113,0.2); color:#2ecc71; padding:8px 16px; border-radius:8px; font-weight:600">✓ You have voted</div>' : ''}
            </div>
            <div class="grid-container">
                ${list || '<p style="color:var(--text-muted)">No contestants found.</p>'}
            </div>
        `;
    } 
    else if (activeTab === 'rankings') {
        const rows = leaderboard.map((c, i) => `
            <div class="leaderboard-row">
                <div class="rank-number rank-${i+1}">${i+1}</div>
                <div class="lb-details">
                    <h4>${c.name}</h4>
                    <span>${c.talentType}</span>
                </div>
                <div class="lb-votes">${c.votes}</div>
            </div>
        `).join('');

        content = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">Leaderboard</h2>
                    <p class="page-subtitle">Real-time vote counts.</p>
                </div>
                <button class="btn-ghost" onclick="fetchDataForTab('rankings')">Refresh</button>
            </div>
            <div class="leaderboard-list">
                ${rows || '<div style="padding:20px; text-align:center; color:var(--text-muted)">No data available</div>'}
            </div>
        `;
    }
    else if (activeTab === 'manage' && isAdmin) {
        // Admin View
        const pending = adminContestants.filter(c => c.status === 'pending');
        const others = adminContestants.filter(c => c.status !== 'pending');

        const renderRow = (c) => `
            <div class="leaderboard-row" style="grid-template-columns: 1fr 100px 140px;">
                <div class="lb-details">
                    <h4>${c.name} <span style="font-size:12px; color:var(--text-muted)">(${c.universityId})</span></h4>
                    <span>${c.talentType}</span>
                </div>
                <div style="text-align:center">
                    <span style="color:${c.status==='approved'?'#2ecc71':c.status==='rejected'?'#ff7675':'#fdcb6e'}">${c.status.toUpperCase()}</span>
                </div>
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    ${c.status !== 'approved' ? `<button onclick="adminAction('${c._id}', 'approved')" style="padding:4px 8px; border-radius:4px; border:none; background:#2ecc71; color:white; cursor:pointer">Approve</button>` : ''}
                    ${c.status !== 'rejected' ? `<button onclick="adminAction('${c._id}', 'rejected')" style="padding:4px 8px; border-radius:4px; border:none; background:#ff7675; color:white; cursor:pointer">Reject</button>` : ''}
                    <button onclick="adminDelete('${c._id}')" style="padding:4px 8px; border-radius:4px; border:1px solid #636e72; background:transparent; color:#b2bec3; cursor:pointer">Del</button>
                </div>
            </div>
        `;

        content = `
            <div class="page-header">
                <div><h2 class="page-title">Management</h2><p class="page-subtitle">Admin Panel</p></div>
                <button class="btn-ghost" onclick="fetchDataForTab('manage')">Refresh</button>
            </div>
            <h3 style="margin-bottom:10px; color:var(--text-muted)">Pending Approvals (${pending.length})</h3>
            <div class="leaderboard-list" style="margin-bottom:30px">
                ${pending.length ? pending.map(renderRow).join('') : '<div style="padding:20px; text-align:center; opacity:0.5">No pending requests</div>'}
            </div>
            <h3 style="margin-bottom:10px; color:var(--text-muted)">All Contestants</h3>
            <div class="leaderboard-list">
                ${others.map(renderRow).join('')}
            </div>
        `;
    }
    else if (activeTab === 'settings') {
        content = `
            <div class="page-header"><h2 class="page-title">Settings</h2></div>
            <div class="glass-card" style="max-width:400px">
                <h3>${user.email}</h3>
                <p style="color:var(--text-muted); margin-bottom:20px; text-transform:capitalize">Role: ${user.role}</p>
                <button class="btn-primary" onclick="handleLogout()" style="background:#2d3436; border:1px solid rgba(255,255,255,0.1)">Sign Out</button>
            </div>
        `;
    }

        const navItems = [
                { tab: 'vote', label: 'Vote', icon: '🗳️' },
                { tab: 'rankings', label: 'Rankings', icon: '🏆' },
                ...(isAdmin ? [{ tab: 'manage', label: 'Manage', icon: '🛡️' }] : []),
                { tab: 'settings', label: 'Settings', icon: '⚙️' },
        ];

        const desktopNav = navItems.map((item) => (
            `<a class="sidebar-nav-link ${activeTab === item.tab ? 'active' : ''}" href="#${item.tab}" data-tab="${item.tab}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            </a>`
        )).join('');

        const mobileNav = navItems.map((item) => (
            `<a class="mobile-nav-item ${activeTab === item.tab ? 'active' : ''}" href="#${item.tab}" data-tab="${item.tab}">
                <span class="mobile-nav-icon">${item.icon}</span> ${item.tab === 'settings' ? 'Config' : item.label}
            </a>`
        )).join('');

        // Sidebar
    return `
      <div class="dashboard-shell">
        <aside class="dashboard-sidebar">
           <div class="sidebar-header">
             <div class="brand">SLIIT's Got Talent</div>
           </div>
           
                     <nav class="sidebar-nav" aria-label="Dashboard navigation">
                         ${desktopNav}
                     </nav>

           <div class="user-profile">
              <div class="user-avatar">${user.email.charAt(0).toUpperCase()}</div>
              <div class="user-info">
                 <div>${user.email.split('@')[0]}</div>
                 <div>${user.role}</div>
              </div>
           </div>
        </aside>

        <main class="dashboard-main">
           ${content}
        </main>
        
        <nav class="mobile-nav" style="display:none">
          ${mobileNav}
        </nav>
      </div>
    `;           
}

let hashRoutingInitialized = false;
function initHashRouting() {
    if (hashRoutingInitialized) return;
    hashRoutingInitialized = true;

    function syncFromHash() {
        if (!state) return;
        if (state.view !== 'dashboard') return;

        const tab = tabFromHash();
        if (!tab) return;
        if (tab === 'manage' && state.user?.role !== 'admin') return;
        if (tab === state.activeTab) return;
        setState({ activeTab: tab, error: '', info: '' });
    }

    window.addEventListener('hashchange', syncFromHash);
    // Initial sync
    syncFromHash();

    // Fallback: poll hash in case hashchange is blocked/not fired
    setInterval(function () {
        try { syncFromHash(); } catch (e) { /* ignore */ }
    }, 200);
}

// Helpers for Admin
window.adminAction = async (id, status) => {
    try {
        await api.put(`/contestants/${id}`, { status });
        const updated = state.adminContestants.map(c => c._id === id ? { ...c, status } : c);
        setState({ adminContestants: updated });
    } catch(e) { console.error(e); }
};

window.adminDelete = async (id) => {
    if(!confirm('Delete?')) return;
    try {
        await api.delete(`/contestants/${id}`);
        const updated = state.adminContestants.filter(c => c._id !== id);
        setState({ adminContestants: updated });
    } catch(e) { console.error(e); }
};

window.handleLogout = () => {
    localStorage.clear();
    setState({ view:'landing', user:null, step:1 });
};

// --- MAIN RENDER LOOP ---
function render() {
    let html = '';
    switch (state.view) {
        case 'landing': html = renderLanding(); break;
        case 'auth': html = renderAuth(); break;
        case 'register': html = renderRegister(); break;
        case 'dashboard': html = renderDashboard(); break;
    }
    root.innerHTML = html;
}

// Init
window.onload = () => {
    // If someone lands directly on a hash, prefer it
    const initialTab = tabFromHash();
    if (initialTab) {
        state.activeTab = initialTab;
    }
    initHashRouting();
    render();
};
// Handle URL params or global errors here if needed
window.setState = setState; 


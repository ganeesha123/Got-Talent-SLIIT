const fs = require('fs');

const particleHTML = `
      <div class="landing-page">
          <div class="mesh-bg">
            <div class="particles"></div>
            <div class="mesh-blob blob-1"></div>
            <div class="mesh-blob blob-2"></div>
            <div class="mesh-blob blob-3"></div>
          </div>

          <nav class="landing-nav reveal active">
            <div class="logo">SLIIT's Got Talent <span class="live-badge">LIVE</span></div>
            <button class="nav-login-btn" onclick="setState({view: 'auth', step: 1})">Sign in / Vote</button>
          </nav>

          <header class="hero-section reveal active">
            <div class="hero-tagline">The Grand Finale 2026</div>
            <h1 class="hero-title glitch-wrapper" data-text="Decide the Ultimate Champion">
              Decide the <span>Ultimate Champion</span>
            </h1>
            <p class="hero-desc reveal">Witness extraordinary performances from the brightest minds. Your voice matters — cast your vote securely and instantly to crown this year's winner.</p>
            <div class="hero-buttons reveal">
              <button class="btn-primary-modern" onclick="setState({view: 'auth', step: 1})">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Cast Your Vote
              </button>
              <button class="btn-secondary-modern" onclick="document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'})">Learn More</button>
            </div>
          </header>

          <main class="features-section reveal" id="how-it-works">
            <div class="features-grid">
              <div class="glass-card">
                <div class="card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3>Secure Voting</h3>
                <p>Log in using your @sliit.lk or @my.sliit.lk email. Our verified OTP system ensures every vote is authentic.</p>
              </div>
              <div class="glass-card">
                <div class="card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <h3>Live Performances</h3>
                <p>Experience the thrill live at the SLIIT Main Auditorium. Watch as stars are born on stage.</p>
              </div>
              <div class="glass-card">
                <div class="card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                </div>
                <h3>One Vote</h3>
                <p>Every student gets exactly one vote. Review the contestants carefully and make your choice count!</p>
              </div>
            </div>
          </main>

          <footer class="footer-modern reveal">
            <div>SLIIT's Got Talent © 2026. All rights reserved.</div>
            <p>Made for SLIIT Students</p>
          </footer>
        </div>
        <script>setTimeout(function(){ initModernLanding && initModernLanding(); }, 100);</script>
`;

// Read the file
let content = fs.readFileSync('d:\\project\\SLIIT-s-Got-Talent\\web-app\\main.js', 'utf8');

// The marker for replacement
const regex = /<div class="landing-page">[\s\S]*?<footer class="footer-modern">[\s\S]*?<\/footer>\s*<\/div>/;

if (regex.test(content)) {
    content = content.replace(regex, particleHTML);
    // Also inject the init call if not present (the script tag handles it though)
    // But since innerHTML script tags don't run, we must add the call manually to the JS string
    
    // However, I can't easily execute JS from innerHTML.
    // So I will append the call to initModernLanding() inside the main.js render function.
    
    // Find where the block ends: return;
    const renderBlockEnd = `    return;
  }

  if (view === 'home') {`;
  
    const newRenderBlockEnd = `    setTimeout(function(){ if(typeof initModernLanding === 'function') initModernLanding(); }, 50);
    return;
  }

  if (view === 'home') {`;
  
    content = content.replace(renderBlockEnd, newRenderBlockEnd);
    
    fs.writeFileSync('d:\\project\\SLIIT-s-Got-Talent\\web-app\\main.js', content);
    console.log('Main.js updated with modern structure.');
} else {
    console.log('Could not find landing page structure to replace.');
}

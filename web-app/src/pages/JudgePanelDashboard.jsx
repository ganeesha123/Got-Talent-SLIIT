import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

const JudgePanelDashboard = ({ embedded = false }) => {
  const { user, token } = useAuth();
  
  const loggedInJudge = useMemo(() => ({
    id: user?._id || 2,
    name: user?.email?.split('@')[0] || "Judge",
    role: "Professional Judge",
    photo: "https://ui-avatars.com/api/?name=" + (user?.email?.split('@')[0] || "Judge"),
    email: user?.email,
  }), [user]);

  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContestantId, setActiveContestantId] = useState(null);

  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const res = await api.get({ path: '/contestants', token });
        const dataArray = Array.isArray(res) ? res : (res.data || []);
        
        const initialSubmitted = {};
        const initialScores = {};

        const formatted = dataArray.map(c => {
          const myScoreObj = (c.judgeScores || []).find(s => s.judgeId === loggedInJudge.id);
          
          if (myScoreObj) {
            initialSubmitted[c._id] = { judgeId: loggedInJudge.id, contestantId: c._id, judgeScore: myScoreObj.score };
            
            const base = Math.floor(myScoreObj.score / 4);
            const rem = myScoreObj.score % 4;
            initialScores[c._id] = {
              creativity: base + rem,
              presentation: base,
              skillLevel: base,
              audienceImpact: base
            };
          }

          return {
            id: c._id,
            name: c.name,
            category: c.talentType || "General",
            performanceTitle: c.description || "N/A",
            photo: c.imageUrl ? (api.toServerAssetUrl?.(c.imageUrl) || c.imageUrl) : "https://ui-avatars.com/api/?name=" + c.name,
            status: "Ready for Review",
            timeSlot: "TBA"
          };
        });
        
        setContestants(formatted);
        setSubmittedResults(initialSubmitted);
        setScores(initialScores);
        if (formatted.length > 0) setActiveContestantId(formatted[0].id);
      } catch (err) {
        console.error("Failed to load contestants:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContestants();
  }, [token, loggedInJudge.id]);

  const [scores, setScores] = useState({});
  const [submittedResults, setSubmittedResults] = useState({});

  const criteria = [
    { key: "creativity", label: "Creativity", helper: "Originality & uniqueness", max: 25 },
    { key: "presentation", label: "Presentation", helper: "Stage presence & delivery", max: 25 },
    { key: "skillLevel", label: "Skill Level", helper: "Technical ability", max: 25 },
    { key: "audienceImpact", label: "Audience Impact", helper: "Engagement & overall response", max: 25 },
  ];

  const categories = ["All", ...new Set(contestants.map((c) => c.category))];

  const filteredContestants = useMemo(() => {
    return contestants.filter((contestant) => {
      const matchesCategory = selectedCategory === "All" || contestant.category === selectedCategory;
      const matchesSearch =
        contestant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.performanceTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [contestants, selectedCategory, searchTerm]);

  const handleScoreChange = (id, field, value) => {
    const score = Math.max(0, Math.min(25, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: score },
    }));
  };

  const calculateJudgeTotal = (id) => {
    const s = scores[id] || {};
    return (s.creativity || 0) + (s.presentation || 0) + (s.skillLevel || 0) + (s.audienceImpact || 0);
  };

  const handleSubmit = async (contestant) => {
    const judgeTotal = calculateJudgeTotal(contestant.id);
    
    try {
      await api.put({
        path: `/contestants/${contestant.id}/score`,
        body: { score: judgeTotal },
        token
      });

      const result = {
        judgeId: loggedInJudge.id,
        contestantId: contestant.id,
        judgeScore: judgeTotal,
        criteria: scores[contestant.id] || {},
      };

      setSubmittedResults((prev) => ({ ...prev, [contestant.id]: result }));
      setMessage(`✅ Score submitted for ${contestant.name}: ${judgeTotal}/100`);
      
      // Auto-select next contestant
      const currentIndex = filteredContestants.findIndex(c => c.id === contestant.id);
      if (currentIndex < filteredContestants.length - 1) {
        setTimeout(() => setActiveContestantId(filteredContestants[currentIndex + 1].id), 1500);
      }
      
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Failed to submit score: ${err.message}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const scoreboard = contestants
    .map((contestant) => {
      const saved = submittedResults[contestant.id];
      return {
        id: contestant.id,
        name: contestant.name,
        photo: contestant.photo,
        judgeScore: saved ? saved.judgeScore : calculateJudgeTotal(contestant.id),
      };
    })
    .sort((a, b) => b.judgeScore - a.judgeScore);

  if (loading) {
    return <div style={{...styles.page, ...(embedded ? styles.embeddedPage : {}), display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#fff'}}>Loading Stage...</h2></div>;
  }

  if (contestants.length === 0) {
    return <div style={{...styles.page, ...(embedded ? styles.embeddedPage : {}), display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#fff'}}>No Contestants Found</h2></div>;
  }

  const activeContestant = contestants.find((c) => c.id === activeContestantId) || contestants[0];
  const activeTotal = calculateJudgeTotal(activeContestant.id);
  const isSubmitted = !!submittedResults[activeContestant.id];

  return (
    <div style={{...styles.page, ...(embedded ? styles.embeddedPage : {})}} className="judge-panel">
      
      <style>{`
        .judge-panel input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: rgba(255,255,255,0.05);
          height: 8px;
          border-radius: 4px;
          outline: none;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
        }
        .judge-panel input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #23c9ff;
          cursor: pointer;
          border: 3px solid #111832;
          box-shadow: 0 0 12px rgba(35, 201, 255, 0.6);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .judge-panel input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          background: #50ffa3;
          box-shadow: 0 0 15px rgba(80, 255, 163, 0.8);
        }
        .queueCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .quickBtnClass:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: scale(1.05);
        }
        .focus-banner {
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .judge-panel select option {
          background-color: #111832;
          color: #ffffff;
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {!embedded && <div style={styles.bgOrbOne} />}
      {!embedded && <div style={styles.bgOrbTwo} />}

      {message && (
        <div style={styles.toast}>
          {message}
        </div>
      )}

      <div style={{...styles.shell, ...(embedded ? styles.embeddedShell : {})}}>
        {/* SIDEBAR - Hidden when embedded inside Dashboard */}
        {!embedded && (
          <aside style={styles.sidebar}>
            <div style={styles.brandBox}>
              <div style={styles.brandLogo}>SGT</div>
              <div>
                <h2 style={styles.brandTitle}>SLIIT Talent</h2>
                <p style={styles.brandSub}>Judge Panel</p>
              </div>
            </div>

            <div style={styles.sidebarCard}>
              <div style={styles.judgeProfileRow}>
                <img src={loggedInJudge.photo} alt={loggedInJudge.name} style={styles.profileAvatarLarge} />
                <div>
                  <h3 style={styles.sidebarJudge}>{loggedInJudge.name}</h3>
                  <p style={styles.sidebarMutedSmall}>{loggedInJudge.role}</p>
                </div>
              </div>
            </div>

            <div style={styles.sidebarCard}>
              <h4 style={styles.sidebarLabel}>Live Scoreboard</h4>
              <div style={styles.leaderboardList}>
                {scoreboard.map((item, index) => (
                  <div key={item.id} style={styles.leaderItem}>
                    <div style={styles.leaderLeft}>
                      <span style={styles.rankText}>#{index + 1}</span>
                      <img src={item.photo} alt={item.name} style={styles.leaderPhoto} />
                      <span style={styles.leaderName}>{item.name}</span>
                    </div>
                    <strong style={styles.leaderScore}>{item.judgeScore}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {/* HEADER */}
          <header style={styles.topbar}>
            <div>
              <p style={styles.eyebrowTitle}>JUDGE PANEL DASHBOARD</p>
              <h1 style={styles.mainTitle}>Professional Judge Scoring Panel</h1>
            </div>
            <div style={styles.sessionBadge}>
              <span style={styles.statusDot}></span>
              Session Active
            </div>
          </header>

          {/* FILTER BAR */}
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Search contestant or performance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* FOCUS SCORING AREA */}
          <div style={styles.focusCard} className="focus-banner">
            <div style={styles.focusHeader}>
              <div style={styles.focusProfile}>
                <img src={activeContestant.photo} alt={activeContestant.name} style={styles.avatarHuge} />
                <div>
                  <span style={styles.categoryBadge}>{activeContestant.category}</span>
                  <h2 style={styles.focusName}>{activeContestant.name}</h2>
                  <p style={styles.focusPerformance}>"{activeContestant.performanceTitle}" • {activeContestant.timeSlot}</p>
                </div>
              </div>
              <div style={styles.focusTotalBox}>
                <span style={styles.totalLabel}>Total Score</span>
                <span style={{...styles.totalValue, color: isSubmitted ? "#50ffa3" : "#fff"}}>{activeTotal}</span>
                <span style={styles.totalMax}>/100</span>
              </div>
            </div>

            <div style={styles.criteriaGrid}>
              {criteria.map((criterion) => {
                const val = scores[activeContestant.id]?.[criterion.key] || 0;
                return (
                  <div key={criterion.key} style={styles.criterionBox}>
                    <div style={styles.critTop}>
                      <div>
                        <h4 style={styles.critLabel}>{criterion.label}</h4>
                        <p style={styles.critHelper}>{criterion.helper}</p>
                      </div>
                      <div style={styles.critScoreBadge}>{val} / {criterion.max}</div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={val}
                      disabled={isSubmitted}
                      onChange={(e) => handleScoreChange(activeContestant.id, criterion.key, e.target.value)}
                      style={styles.rangeLarge}
                    />
                    
                    {/* Quick Buttons for faster scoring */}
                    {!isSubmitted && (
                      <div style={styles.quickButtons}>
                        {[10, 15, 20, 25].map(num => (
                          <button 
                            key={num} 
                            onClick={() => handleScoreChange(activeContestant.id, criterion.key, num)}
                            className="quickBtnClass"
                            style={val === num ? styles.quickBtnActive : styles.quickBtn}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.actionArea}>
              <button 
                style={isSubmitted ? styles.submittedBtn : styles.submitBtn}
                onClick={() => handleSubmit(activeContestant)}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Score Submitted Successfully" : "Finalize & Submit Score"}
              </button>
            </div>
          </div>

          {/* UP NEXT QUEUE */}
          <div>
            <h3 style={styles.queueTitle}>Up Next / Other Contestants</h3>
            <div style={styles.queueGrid}>
              {filteredContestants.map(c => (
                <div 
                  key={c.id} 
                  className="queueCard"
                  onClick={() => setActiveContestantId(c.id)}
                  style={{
                    ...styles.queueCard,
                    borderColor: activeContestantId === c.id ? "#23c9ff" : "rgba(255,255,255,0.08)",
                    background: activeContestantId === c.id ? "rgba(35, 201, 255, 0.15)" : "rgba(255,255,255,0.03)",
                    boxShadow: activeContestantId === c.id ? "0 0 20px rgba(35, 201, 255, 0.2)" : "none"
                  }}
                >
                  <img src={c.photo} alt={c.name} style={styles.queueAvatar} />
                  <div>
                    <h4 style={styles.queueName}>{c.name}</h4>
                    <p style={styles.queueSub}>{c.category}</p>
                  </div>
                  {submittedResults[c.id] && <div style={styles.checkIcon}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Styling Object
const glass = {
  background: "linear-gradient(145deg, rgba(20, 25, 45, 0.65), rgba(10, 15, 30, 0.8))",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #070B19 0%, #111832 50%, #0F1322 100%)", color: "#f8fafc", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", position: "relative", padding: "30px", overflowX: "hidden" },
  embeddedPage: { minHeight: "auto", background: "transparent", padding: "10px", margin: 0 },
  bgOrbOne: { position: "absolute", top: "-10%", right: "10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(233,69,96,0.15) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" },
  bgOrbTwo: { position: "absolute", bottom: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(233,69,96,0.1) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" },
  toast: { position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #12b86d, #0ba35c)", padding: "12px 24px", borderRadius: "30px", fontWeight: "bold", zIndex: 100, boxShadow: "0 10px 30px rgba(18, 184, 109, 0.3)", animation: "fadeIn 0.3s ease" },
  shell: { maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "30px", position: "relative", zIndex: 2 },
  embeddedShell: { gridTemplateColumns: "1fr", maxWidth: "1200px" },
  
  sidebar: { ...glass, borderRadius: "24px", padding: "24px", height: "fit-content", position: "sticky", top: "30px" },
  brandBox: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "30px" },
  brandLogo: { width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", background: "linear-gradient(135deg, #e94560, #d1314a)", color: "#fff" },
  brandTitle: { margin: 0, fontSize: "20px", fontWeight: "800", color: "#e94560" },
  brandSub: { margin: "4px 0 0 0", color: "#f8fafc", fontSize: "13px", fontWeight: "600" },
  sidebarCard: { background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "16px", marginBottom: "20px" },
  judgeProfileRow: { display: "flex", alignItems: "center", gap: "14px" },
  
  // Image styles added here 👇
  profileAvatarLarge: { width: "50px", height: "50px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" },
  
  sidebarJudge: { margin: 0, fontSize: "16px", fontWeight: "700" },
  sidebarMutedSmall: { margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "12px" },
  sidebarLabel: { margin: "0 0 16px 0", color: "#8fb6ff", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" },
  leaderboardList: { display: "flex", flexDirection: "column", gap: "10px" },
  leaderItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" },
  leaderLeft: { display: "flex", alignItems: "center", gap: "10px" },
  rankText: { color: "#e94560", fontSize: "12px", fontWeight: "bold", minWidth: "20px" },
  
  // Leaderboard photo style 👇
  leaderPhoto: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  
  leaderName: { fontSize: "14px", fontWeight: "600", color: "#f8fafc" },
  leaderScore: { color: "#e94560", fontSize: "16px" },
  
  main: { display: "flex", flexDirection: "column", gap: "24px" },
  
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "10px" },
  eyebrowTitle: { margin: 0, color: "#e94560", fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "600" },
  mainTitle: { margin: "6px 0 0 0", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px", color: "#f8fafc" },
  sessionBadge: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 18px", background: "rgba(25, 45, 75, 0.6)", border: "1px solid rgba(40, 80, 130, 0.5)", borderRadius: "30px", color: "#aed4ff", fontSize: "14px", fontWeight: "600" },
  statusDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#50ffa3", boxShadow: "0 0 10px rgba(80, 255, 163, 0.6)" },

  filterBar: { display: "flex", gap: "12px", marginBottom: "10px" },
  input: { flex: 1, maxWidth: "350px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", transition: "0.2s" },
  select: { width: "180px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff" },
  
  focusCard: { ...glass, borderRadius: "28px", padding: "34px", position: "relative", overflow: "hidden" },
  focusHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" },
  focusProfile: { display: "flex", alignItems: "center", gap: "20px" },
  
  // Huge photo style for focus area 👇
  avatarHuge: { width: "96px", height: "96px", borderRadius: "24px", objectFit: "cover", flexShrink: 0, boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)" },
  
  categoryBadge: { display: "inline-block", background: "rgba(35, 201, 255, 0.15)", color: "#23c9ff", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" },
  focusName: { margin: 0, fontSize: "26px", fontWeight: "800" },
  focusPerformance: { margin: "6px 0 0 0", color: "rgba(255,255,255,0.6)", fontSize: "15px" },
  focusTotalBox: { background: "rgba(0,0,0,0.3)", padding: "16px 24px", borderRadius: "16px", textAlign: "right" },
  totalLabel: { display: "block", fontSize: "12px", color: "#8fb6ff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
  totalValue: { fontSize: "36px", fontWeight: "900" },
  totalMax: { fontSize: "18px", color: "rgba(255,255,255,0.4)" },
  criteriaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "30px" },
  criterionBox: { background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" },
  critTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  critLabel: { margin: 0, fontSize: "16px", fontWeight: "700" },
  critHelper: { margin: "4px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  critScoreBadge: { background: "rgba(111,76,255,0.2)", color: "#dbe0ff", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" },
  rangeLarge: { width: "100%", height: "6px", borderRadius: "4px", accentColor: "#23c9ff", cursor: "pointer", marginBottom: "16px" },
  quickButtons: { display: "flex", gap: "8px" },
  quickBtn: { flex: 1, padding: "8px 0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", cursor: "pointer", transition: "0.2s" },
  quickBtnActive: { flex: 1, padding: "8px 0", background: "#6f4cff", border: "1px solid #6f4cff", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  submitBtn: { background: "linear-gradient(135deg, #6f4cff, #23c9ff)", color: "#fff", border: "none", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 20px rgba(111,76,255,0.3)" },
  submittedBtn: { background: "rgba(255,255,255,0.1)", color: "#50ffa3", border: "1px solid rgba(80,255,163,0.3)", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "not-allowed" },
  queueTitle: { margin: "10px 0 16px 0", fontSize: "18px", fontWeight: "700" },
  queueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  queueCard: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "16px", border: "1px solid", cursor: "pointer", transition: "all 0.2s ease", position: "relative" },
  
  // Queue profile photo style 👇
  queueAvatar: { width: "42px", height: "42px", borderRadius: "12px", objectFit: "cover", flexShrink: 0 },
  
  queueName: { margin: 0, fontSize: "14px", fontWeight: "700" },
  queueSub: { margin: "2px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  checkIcon: { position: "absolute", right: "12px", background: "#12b86d", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }
};

export default JudgePanelDashboard;
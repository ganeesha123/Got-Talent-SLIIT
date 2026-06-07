import React, { useMemo, useState, useEffect } from "react";
import { api } from '../services/apiClient.js';

function calculateWeightedScore(contestant) {
  // Use dynamically calculated maxes from the API response mapping
  const publicMax = contestant.maxVotes || 1000;
  const judgeMax = contestant.maxJudgeScore || 100;

  const publicPercent = (contestant.publicVotes / publicMax) * 100;
  const judgePercent = (contestant.judgeScore / judgeMax) * 100;
  return Number((publicPercent * 0.4 + judgePercent * 0.6).toFixed(1));
}

function FinalLeaderboardDashboard() {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLiveStats = async () => {
      try {
        const res = await api.get({ path: '/contestants' });
        if (!isMounted) return;

        const dataArray = Array.isArray(res) ? res : (res.data || []);
        const liveData = dataArray.map(c => {
          // Calculate average judge score from array of score objects
          const scores = c.judgeScores || [];
          const totalJudgeScore = scores.reduce((sum, s) => sum + s.score, 0);
          const avgJudgeScore = scores.length > 0 ? totalJudgeScore / scores.length : 0;

          return {
            id: c._id,
            name: c.name,
            category: c.talentType || "General",
            publicVotes: c.votes || 0,
            maxVotes: 1000, // Assuming 1000 is our cap for 100% normalization
            judgeScore: avgJudgeScore,
            maxJudgeScore: 100, // Judges score out of 100
            trend: [40, 50, 60, 70, 80], // Hardcoded trends for UI purposes
            status: "Stable"
          };
        });

        setContestants(liveData);
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveStats();
    
    // Setup 5-second polling interval
    const intervalId = setInterval(fetchLiveStats, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const categories = ["All", ...new Set(contestants.map((c) => c.category))];

  const filteredContestants = useMemo(() => {
    return contestants.filter((contestant) => {
      const matchesCategory =
        selectedCategory === "All" || contestant.category === selectedCategory;

      const matchesSearch =
        contestant.name.toLowerCase().includes(search.toLowerCase()) ||
        contestant.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [contestants, selectedCategory, search]);

  const rankedContestants = useMemo(() => {
    return [...filteredContestants]
      .map((contestant) => ({
        ...contestant,
        weightedScore: calculateWeightedScore(contestant),
        publicPercent: Math.round(
          (contestant.publicVotes / contestant.maxVotes) * 100
        ),
        judgePercent: Math.round(
          (contestant.judgeScore / contestant.maxJudgeScore) * 100
        ),
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }, [filteredContestants]);

  const topThree = rankedContestants.slice(0, 3);

  const totalVotes = rankedContestants.reduce(
    (sum, contestant) => sum + contestant.publicVotes,
    0
  );

  const avgJudgeScore =
    rankedContestants.length > 0
      ? (
          rankedContestants.reduce(
            (sum, contestant) => sum + contestant.judgeScore,
            0
          ) / rankedContestants.length
        ).toFixed(1)
      : 0;

  const highestScore =
    rankedContestants.length > 0 ? rankedContestants[0].weightedScore : 0;

  const voteBars = rankedContestants.slice(0, 5);
  const judgeBars = rankedContestants.slice(0, 5);

  return (
    <div className="leaderboard-shell">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #0b1020;
        }

        .leaderboard-shell {
          min-height: 100vh;
          color: #f8fafc;
          background:
            radial-gradient(circle at top left, rgba(236, 72, 153, 0.20), transparent 24%),
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 24%),
            linear-gradient(180deg, #0b1020 0%, #111827 100%);
          padding: 24px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          margin-bottom: 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
        }

        .brand h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .brand p {
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 14px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.14);
          color: #a7f3d0;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        .topbar-right {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .input,
        .select {
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding: 0 14px;
          outline: none;
          min-width: 190px;
        }

        .select option {
          color: #111827;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .stat-card {
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 45px rgba(0,0,0,0.22);
        }

        .stat-label {
          color: #cbd5e1;
          font-size: 13px;
          margin-bottom: 10px;
          display: block;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
        }

        .stat-sub {
          margin-top: 8px;
          font-size: 13px;
          color: #94a3b8;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 20px;
          margin-bottom: 22px;
        }

        .card {
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.035));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 45px rgba(0,0,0,0.24);
          overflow: hidden;
        }

        .card-body {
          padding: 22px;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 12px;
        }

        .section-title h2,
        .section-title h3 {
          margin: 0;
        }

        .section-title p {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .podium {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: end;
        }

        .podium-card {
          padding: 18px;
          border-radius: 22px;
          text-align: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .podium-card.first {
          min-height: 260px;
          background: linear-gradient(180deg, rgba(250,204,21,0.24), rgba(255,255,255,0.06));
        }

        .podium-card.second {
          min-height: 220px;
          background: linear-gradient(180deg, rgba(148,163,184,0.24), rgba(255,255,255,0.06));
        }

        .podium-card.third {
          min-height: 200px;
          background: linear-gradient(180deg, rgba(251,146,60,0.24), rgba(255,255,255,0.06));
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .podium-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .podium-category {
          font-size: 13px;
          color: #cbd5e1;
          margin-bottom: 12px;
        }

        .podium-score {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .podium-meta {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.7;
        }

        .smart-panel {
          display: grid;
          gap: 14px;
        }

        .smart-box {
          padding: 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .smart-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .smart-title {
          font-size: 14px;
          font-weight: 700;
        }

        .smart-value {
          font-size: 24px;
          font-weight: 800;
        }

        .smart-desc {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
        }

        .leaderboard-table {
          display: grid;
          gap: 12px;
        }

        .table-head,
        .table-row {
          display: grid;
          grid-template-columns: 70px 1.4fr 1fr 1fr 1fr 120px;
          gap: 12px;
          align-items: center;
        }

        .table-head {
          color: #94a3b8;
          font-size: 13px;
          padding: 0 12px 10px;
        }

        .table-row {
          padding: 16px 12px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .rank-pill {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(236,72,153,0.25), rgba(59,130,246,0.22));
          font-weight: 800;
        }

        .contestant-name {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .contestant-sub {
          font-size: 12px;
          color: #94a3b8;
        }

        .score-big {
          font-weight: 800;
          font-size: 20px;
        }

        .mini-text {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .status {
          display: inline-flex;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .status.rising {
          background: rgba(16,185,129,0.15);
          color: #a7f3d0;
        }

        .status.stable {
          background: rgba(59,130,246,0.15);
          color: #bfdbfe;
        }

        .status.improving {
          background: rgba(249,115,22,0.15);
          color: #fdba74;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-card {
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.035));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 18px 45px rgba(0,0,0,0.24);
          padding: 22px;
        }

        .bar-chart {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: end;
          gap: 14px;
          height: 240px;
          margin-top: 22px;
        }

        .bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .bar-track {
          width: 100%;
          height: 190px;
          display: flex;
          align-items: end;
        }

        .bar {
          width: 100%;
          border-radius: 18px 18px 8px 8px;
          background: linear-gradient(180deg, #ec4899, #8b5cf6);
          box-shadow: 0 12px 24px rgba(236,72,153,0.22);
        }

        .bar.blue {
          background: linear-gradient(180deg, #38bdf8, #3b82f6);
          box-shadow: 0 12px 24px rgba(59,130,246,0.22);
        }

        .bar-label {
          text-align: center;
          font-size: 12px;
          color: #cbd5e1;
        }

        .bar-value {
          font-size: 12px;
          color: #94a3b8;
        }

        .trend-list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .trend-item {
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .trend-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          gap: 12px;
        }

        .trend-name {
          font-weight: 700;
        }

        .sparkline {
          display: flex;
          align-items: end;
          gap: 5px;
          height: 54px;
        }

        .spark {
          flex: 1;
          border-radius: 8px 8px 4px 4px;
          background: linear-gradient(180deg, #22c55e, #06b6d4);
          min-width: 8px;
        }

        .footer-note {
          margin-top: 18px;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.7;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .main-grid,
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .leaderboard-shell {
            padding: 14px;
          }

          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .topbar-right {
            width: 100%;
            flex-direction: column;
          }

          .input,
          .select {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .podium {
            grid-template-columns: 1fr;
          }

          .table-head {
            display: none;
          }

          .table-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
      
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ marginTop: '20px', fontWeight: '600' }}>Starting Live Dashboard...</h2>
          <p style={{ color: '#94a3b8' }}>Gathering synchronized public votes and judge scores.</p>
        </div>
      ) : (
        <>
          <div className="topbar">
        <div className="brand">
          <h1>SLIIT’s Got Talent - Final Leaderboard</h1>
          <p>
            Final result dashboard with weighted scores, live ranking, vote
            analysis, judge analysis, and performance reporting.
          </p>
          <div className="live-badge">
            <span className="dot"></span>
            Live Leaderboard Active
          </div>
        </div>

        <div className="topbar-right">
          <input
            className="input"
            type="text"
            placeholder="Search contestant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Contestants</span>
          <h2 className="stat-value">{rankedContestants.length}</h2>
          <div className="stat-sub">Qualified for final leaderboard</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Public Votes</span>
          <h2 className="stat-value">{totalVotes}</h2>
          <div className="stat-sub">Combined audience voting count</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Judge Score</span>
          <h2 className="stat-value">{avgJudgeScore}/40</h2>
          <div className="stat-sub">Professional evaluation average</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Highest Weighted Score</span>
          <h2 className="stat-value">{highestScore}</h2>
          <div className="stat-sub">Top final combined result</div>
        </div>
      </section>

      <section className="main-grid">
        <div className="card">
          <div className="card-body">
            <div className="section-title">
              <div>
                <h2>Top 3 Finalists</h2>
                <p>Final ranking based on combined public votes and judge marks</p>
              </div>
            </div>

            <div className="podium">
              {topThree[1] && (
                <div className="podium-card second">
                  <div className="rank-badge">2</div>
                  <div className="podium-name">{topThree[1].name}</div>
                  <div className="podium-category">{topThree[1].category}</div>
                  <div className="podium-score">{topThree[1].weightedScore}</div>
                  <div className="podium-meta">
                    Votes: {topThree[1].publicVotes}/{topThree[1].maxVotes}
                    <br />
                    Judge: {topThree[1].judgeScore}/{topThree[1].maxJudgeScore}
                  </div>
                </div>
              )}

              {topThree[0] && (
                <div className="podium-card first">
                  <div className="rank-badge">1</div>
                  <div className="podium-name">{topThree[0].name}</div>
                  <div className="podium-category">{topThree[0].category}</div>
                  <div className="podium-score">{topThree[0].weightedScore}</div>
                  <div className="podium-meta">
                    Votes: {topThree[0].publicVotes}/{topThree[0].maxVotes}
                    <br />
                    Judge: {topThree[0].judgeScore}/{topThree[0].maxJudgeScore}
                  </div>
                </div>
              )}

              {topThree[2] && (
                <div className="podium-card third">
                  <div className="rank-badge">3</div>
                  <div className="podium-name">{topThree[2].name}</div>
                  <div className="podium-category">{topThree[2].category}</div>
                  <div className="podium-score">{topThree[2].weightedScore}</div>
                  <div className="podium-meta">
                    Votes: {topThree[2].publicVotes}/{topThree[2].maxVotes}
                    <br />
                    Judge: {topThree[2].judgeScore}/{topThree[2].maxJudgeScore}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="section-title">
              <div>
                <h3>Quick Insights</h3>
                <p>Compact final result overview</p>
              </div>
            </div>

            <div className="smart-panel">
              <div className="smart-box">
                <div className="smart-top">
                  <div className="smart-title">Weight Split</div>
                  <div className="smart-value">40 / 60</div>
                </div>
                <div className="smart-desc">
                  Public voting contributes 40% while judge evaluation contributes
                  60% to the final score.
                </div>
              </div>

              <div className="smart-box">
                <div className="smart-top">
                  <div className="smart-title">Current Winner</div>
                  <div className="smart-value">
                    {rankedContestants[0] ? rankedContestants[0].weightedScore : 0}
                  </div>
                </div>
                <div className="smart-desc">
                  {rankedContestants[0]
                    ? `${rankedContestants[0].name} is currently leading the final leaderboard.`
                    : "No contestant data available."}
                </div>
              </div>

              <div className="smart-box">
                <div className="smart-top">
                  <div className="smart-title">Best Judge Mark</div>
                  <div className="smart-value">
                    {rankedContestants.length
                      ? Math.max(...rankedContestants.map((item) => item.judgeScore))
                      : 0}
                    /40
                  </div>
                </div>
                <div className="smart-desc">
                  Highest professional evaluation currently recorded among finalists.
                </div>
              </div>

              <div className="smart-box">
                <div className="smart-top">
                  <div className="smart-title">Vote Momentum</div>
                  <div className="smart-value">
                    {rankedContestants.filter((item) => item.status === "Rising").length}
                  </div>
                </div>
                <div className="smart-desc">
                  Contestants currently showing strong upward movement in the final stage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "22px" }}>
        <div className="card-body">
          <div className="section-title">
            <div>
              <h2>Final Ranking Table</h2>
              <p>Leaderboard sorted by weighted final score</p>
            </div>
          </div>

          <div className="leaderboard-table">
            <div className="table-head">
              <div>Rank</div>
              <div>Contestant</div>
              <div>Public Votes</div>
              <div>Judge Score</div>
              <div>Final Score</div>
              <div>Status</div>
            </div>

            {rankedContestants.map((contestant, index) => (
              <div className="table-row" key={contestant.id}>
                <div>
                  <div className="rank-pill">{index + 1}</div>
                </div>

                <div>
                  <div className="contestant-name">{contestant.name}</div>
                  <div className="contestant-sub">{contestant.category}</div>
                </div>

                <div>
                  <div className="score-big">{contestant.publicVotes}</div>
                  <div className="mini-text">{contestant.publicPercent}% normalized</div>
                </div>

                <div>
                  <div className="score-big">{contestant.judgeScore}/40</div>
                  <div className="mini-text">{contestant.judgePercent}% normalized</div>
                </div>

                <div>
                  <div className="score-big">{contestant.weightedScore}</div>
                  <div className="mini-text">Combined final result</div>
                </div>

                <div>
                  <span className={`status ${contestant.status.toLowerCase()}`}>
                    {contestant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <div className="section-title">
            <div>
              <h3>Vote Analysis</h3>
              <p>Top contestants by public vote count</p>
            </div>
          </div>

          <div className="bar-chart">
            {voteBars.map((contestant) => (
              <div className="bar-wrap" key={contestant.id}>
                <div className="bar-value">{contestant.publicVotes}</div>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{ height: `${contestant.publicPercent}%` }}
                  ></div>
                </div>
                <div className="bar-label">{contestant.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>

          <div className="footer-note">
            This chart shows audience engagement and how public support is distributed
            among the leading contestants.
          </div>
        </div>

        <div className="chart-card">
          <div className="section-title">
            <div>
              <h3>Judge Score Analysis</h3>
              <p>Top contestants by judge evaluation</p>
            </div>
          </div>

          <div className="bar-chart">
            {judgeBars.map((contestant) => (
              <div className="bar-wrap" key={contestant.id}>
                <div className="bar-value">{contestant.judgeScore}/40</div>
                <div className="bar-track">
                  <div
                    className="bar blue"
                    style={{ height: `${contestant.judgePercent}%` }}
                  ></div>
                </div>
                <div className="bar-label">{contestant.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>

          <div className="footer-note">
            This chart compares professional judging marks and highlights stronger
            technical and creative performances.
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "22px" }}>
        <div className="card-body">
          <div className="section-title">
            <div>
              <h2>Performance Trend Overview</h2>
              <p>Simple visual comparison for final reporting</p>
            </div>
          </div>

          <div className="trend-list">
            {rankedContestants.slice(0, 4).map((contestant) => (
              <div className="trend-item" key={contestant.id}>
                <div className="trend-top">
                  <div>
                    <div className="trend-name">{contestant.name}</div>
                    <div className="contestant-sub">{contestant.category}</div>
                  </div>
                  <div className="score-big">{contestant.weightedScore}</div>
                </div>

                <div className="sparkline">
                  {contestant.trend.map((value, idx) => (
                    <div
                      key={idx}
                      className="spark"
                      style={{ height: `${value * 0.55}px` }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="footer-note">
            These trend blocks can represent live voting growth, score movement,
            or final-stage contestant momentum.
          </div>
        </div>
      </section>
      </>
      )}
    </div>
  );
}

export default FinalLeaderboardDashboard;
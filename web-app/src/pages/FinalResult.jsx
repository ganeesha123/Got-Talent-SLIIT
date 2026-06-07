import React, { useMemo, useState, useRef } from "react";

const contestantsData = [
  {
    id: 1,
    name: "Amandi Perera",
    category: "Singing",
    publicVotes: 920,
    maxVotes: 1000,
    judgeScore: 36,
    maxJudgeScore: 40,
    creativity: 9,
    presentation: 9,
    skill: 10,
    audienceImpact: 8,
    trend: [58, 64, 69, 74, 82, 92],
    color: "#f472b6",
  },
  {
    id: 2,
    name: "Kasun Madushan",
    category: "Dancing",
    publicVotes: 870,
    maxVotes: 1000,
    judgeScore: 34,
    maxJudgeScore: 40,
    creativity: 8,
    presentation: 9,
    skill: 9,
    audienceImpact: 8,
    trend: [54, 61, 66, 72, 79, 87],
    color: "#a78bfa",
  },
  {
    id: 3,
    name: "Nethmi Silva",
    category: "Drama",
    publicVotes: 790,
    maxVotes: 1000,
    judgeScore: 38,
    maxJudgeScore: 40,
    creativity: 10,
    presentation: 9,
    skill: 9,
    audienceImpact: 10,
    trend: [50, 56, 61, 68, 75, 82],
    color: "#22d3ee",
  },
  {
    id: 4,
    name: "Ravindu Senanayake",
    category: "Beatboxing",
    publicVotes: 840,
    maxVotes: 1000,
    judgeScore: 32,
    maxJudgeScore: 40,
    creativity: 8,
    presentation: 8,
    skill: 8,
    audienceImpact: 8,
    trend: [52, 58, 63, 70, 76, 84],
    color: "#fb923c",
  },
  {
    id: 5,
    name: "Ishara Fernando",
    category: "Instrumental",
    publicVotes: 710,
    maxVotes: 1000,
    judgeScore: 35,
    maxJudgeScore: 40,
    creativity: 9,
    presentation: 8,
    skill: 9,
    audienceImpact: 9,
    trend: [42, 49, 56, 61, 69, 74],
    color: "#4ade80",
  },
  {
    id: 6,
    name: "Sanduni Jayasinghe",
    category: "Comedy",
    publicVotes: 760,
    maxVotes: 1000,
    judgeScore: 30,
    maxJudgeScore: 40,
    creativity: 8,
    presentation: 7,
    skill: 7,
    audienceImpact: 8,
    trend: [45, 51, 57, 63, 70, 76],
    color: "#60a5fa",
  },
  {
    id: 7,
    name: "Kavindu Perera",
    category: "Magic",
    publicVotes: 680,
    maxVotes: 1000,
    judgeScore: 33,
    maxJudgeScore: 40,
    creativity: 9,
    presentation: 8,
    skill: 8,
    audienceImpact: 8,
    trend: [40, 46, 53, 59, 63, 68],
    color: "#fbbf24",
  },
  {
    id: 8,
    name: "Tharushi Silva",
    category: "Poetry",
    publicVotes: 640,
    maxVotes: 1000,
    judgeScore: 31,
    maxJudgeScore: 40,
    creativity: 8,
    presentation: 8,
    skill: 7,
    audienceImpact: 8,
    trend: [38, 44, 50, 55, 60, 64],
    color: "#2dd4bf",
  },
  {
    id: 9,
    name: "Dulaj Hansana",
    category: "Rap",
    publicVotes: 605,
    maxVotes: 1000,
    judgeScore: 29,
    maxJudgeScore: 40,
    creativity: 7,
    presentation: 8,
    skill: 7,
    audienceImpact: 7,
    trend: [35, 39, 45, 51, 57, 61],
    color: "#f87171",
  },
  {
    id: 10,
    name: "Sithumi Nethara",
    category: "Art Performance",
    publicVotes: 580,
    maxVotes: 1000,
    judgeScore: 28,
    maxJudgeScore: 40,
    creativity: 8,
    presentation: 7,
    skill: 6,
    audienceImpact: 7,
    trend: [30, 35, 40, 47, 53, 58],
    color: "#818cf8",
  },
];

function calculateWeighted(contestant) {
  const publicPercent = (contestant.publicVotes / contestant.maxVotes) * 100;
  const judgePercent = (contestant.judgeScore / contestant.maxJudgeScore) * 100;
  return Number((publicPercent * 0.4 + judgePercent * 0.6).toFixed(1));
}

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function FinalResult() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [printing, setPrinting] = useState(false);
  const reportRef = useRef(null);

  const categories = ["All", ...new Set(contestantsData.map((c) => c.category))];

  const filtered = useMemo(() =>
    contestantsData.filter((c) => {
      const s = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s)) &&
        (category === "All" || c.category === category)
      );
    }), [search, category]);

  const ranked = useMemo(() =>
    [...filtered]
      .map((c) => ({
        ...c,
        weightedScore: calculateWeighted(c),
        publicPercent: Math.round((c.publicVotes / c.maxVotes) * 100),
        judgePercent: Math.round((c.judgeScore / c.maxJudgeScore) * 100),
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore),
    [filtered]);

  const topThree = ranked.slice(0, 3);
  const totalVotes = ranked.reduce((s, c) => s + c.publicVotes, 0);
  const avgJudge = ranked.length
    ? (ranked.reduce((s, c) => s + c.judgeScore, 0) / ranked.length).toFixed(1)
    : 0;

  const pieTotal = ranked.slice(0, 6).reduce((s, c) => s + c.publicVotes, 0);
  let cum = 0;
  const pieSegments = ranked.slice(0, 6).map((c) => {
    const pct = (c.publicVotes / pieTotal) * 100;
    const seg = { ...c, start: cum, percent: pct };
    cum += pct;
    return seg;
  });

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const now = new Date();
  const reportDate = now.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const reportTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={reportRef} style={{ fontFamily: "'Syne', sans-serif", minHeight: "100vh", background: "#07080f", color: "#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #07080f; }

        :root {
          --gold: #FFD700;
          --silver: #94a3b8;
          --bronze: #CD7F32;
          --accent: #e879f9;
          --accent2: #38bdf8;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.07);
          --text-muted: #64748b;
          --radius: 20px;
        }

        .shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        /* HEADER */
        .header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: start;
          padding: 30px 32px;
          background: linear-gradient(135deg, rgba(232,121,249,0.08), rgba(56,189,248,0.06));
          border: 1px solid var(--border);
          border-radius: 28px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 0% 0%, rgba(232,121,249,0.12), transparent 60%),
                      radial-gradient(ellipse at 100% 100%, rgba(56,189,248,0.1), transparent 60%);
          pointer-events: none;
        }

        .header-event {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }

        .header-title {
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(135deg, #fff 40%, #e879f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }

        .header-sub {
          color: var(--silver);
          font-size: 14px;
          line-height: 1.7;
          max-width: 520px;
        }

        .header-meta {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }

        .pill-green {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.25);
          color: #86efac;
        }

        .pill-blue {
          background: rgba(56,189,248,0.1);
          border-color: rgba(56,189,248,0.25);
          color: #7dd3fc;
        }

        .pill-purple {
          background: rgba(232,121,249,0.1);
          border-color: rgba(232,121,249,0.25);
          color: #f0abfc;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: blink 1.4s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .header-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-end;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #e879f9, #a855f7);
          color: #fff;
          box-shadow: 0 8px 24px rgba(232,121,249,0.28);
        }

        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(232,121,249,0.38); }

        .btn-secondary {
          background: var(--surface);
          color: #cbd5e1;
          border: 1px solid var(--border);
        }

        .btn-secondary:hover { background: rgba(255,255,255,0.07); }

        .report-meta {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          text-align: right;
        }

        /* TOOLBAR */
        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-wrap {
          flex: 1;
          min-width: 220px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 16px;
        }

        .toolbar input,
        .toolbar select {
          width: 100%;
          height: 46px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: #f1f5f9;
          padding: 0 14px 0 40px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .toolbar select { padding-left: 14px; }

        .toolbar input:focus,
        .toolbar select:focus { border-color: rgba(232,121,249,0.4); }

        .toolbar select option { background: #1e2030; }

        /* TABS */
        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: var(--surface);
          padding: 6px;
          border-radius: 18px;
          border: 1px solid var(--border);
          width: fit-content;
        }

        .tab {
          padding: 10px 22px;
          border-radius: 13px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          color: var(--silver);
          background: none;
        }

        .tab.active {
          background: linear-gradient(135deg, rgba(232,121,249,0.18), rgba(56,189,248,0.12));
          color: #f1f5f9;
          border: 1px solid rgba(232,121,249,0.2);
        }

        /* STATS */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 22px 20px;
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }

        .stat-card:hover { transform: translateY(-2px); }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 14px;
          background: rgba(255,255,255,0.05);
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-sub {
          margin-top: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        /* PODIUM */
        .podium-section {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 26px;
          overflow: hidden;
        }

        .card-header {
          padding: 22px 24px 0;
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .card-sub {
          font-size: 13px;
          color: var(--text-muted);
        }

        .card-body {
          padding: 20px 24px 24px;
        }

        .podium-stage {
          display: grid;
          grid-template-columns: 1fr 1.1fr 1fr;
          gap: 14px;
          align-items: end;
        }

        .podium-card {
          border-radius: 20px;
          padding: 20px 16px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }

        .podium-card:hover { transform: translateY(-3px); }

        .podium-card.p1 {
          background: linear-gradient(160deg, rgba(255,215,0,0.12), rgba(255,255,255,0.04));
          min-height: 270px;
          border-color: rgba(255,215,0,0.2);
        }

        .podium-card.p2 {
          background: linear-gradient(160deg, rgba(148,163,184,0.1), rgba(255,255,255,0.03));
          min-height: 230px;
        }

        .podium-card.p3 {
          background: linear-gradient(160deg, rgba(205,127,50,0.1), rgba(255,255,255,0.03));
          min-height: 210px;
          border-color: rgba(205,127,50,0.15);
        }

        .medal {
          font-size: 36px;
          margin-bottom: 10px;
          display: block;
        }

        .p-name {
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .p-cat {
          font-size: 12px;
          color: var(--silver);
          margin-bottom: 12px;
        }

        .p-score {
          font-size: 38px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 6px;
        }

        .p-details {
          font-size: 12px;
          color: var(--silver);
          line-height: 1.8;
          font-family: 'JetBrains Mono', monospace;
        }

        .crown {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 22px;
        }

        /* SUMMARY BOXES */
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .sum-box {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
        }

        .sum-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .sum-val {
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sum-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 6px;
          line-height: 1.6;
        }

        /* CHARTS */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 26px;
          padding: 22px;
        }

        .chart-title {
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .chart-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        /* BAR CHART */
        .bars {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 180px;
        }

        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
        }

        .bar-num {
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--silver);
        }

        .bar-track {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
        }

        .bar-fill {
          width: 100%;
          border-radius: 10px 10px 6px 6px;
          transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .bar-fill::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 40%;
          background: rgba(255,255,255,0.12);
          border-radius: inherit;
        }

        .bar-name {
          font-size: 10px;
          color: var(--silver);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* PIE */
        .pie-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .donut {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .donut-hole {
          position: absolute;
          inset: 22px;
          border-radius: 50%;
          background: #07080f;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--silver);
          line-height: 1.4;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .legend-list {
          width: 100%;
          display: grid;
          gap: 7px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-name {
          flex: 1;
          color: #cbd5e1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .legend-pct {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          color: #f1f5f9;
        }

        /* TREND SPARKLINES */
        .trend-list {
          display: grid;
          gap: 14px;
        }

        .trend-row {
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
        }

        .trend-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          gap: 10px;
        }

        .trend-name {
          font-size: 13px;
          font-weight: 700;
        }

        .trend-cat {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .trend-score {
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--accent);
          font-weight: 600;
        }

        .spark {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 40px;
        }

        .spark-bar {
          flex: 1;
          border-radius: 4px 4px 2px 2px;
          min-height: 4px;
        }

        /* RANKING TABLE */
        .table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 26px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .table-controls {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .t-head {
          display: grid;
          grid-template-columns: 56px 1.6fr 1fr 1fr 1fr 0.9fr 1fr;
          gap: 12px;
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .t-row {
          display: grid;
          grid-template-columns: 56px 1.6fr 1fr 1fr 1fr 0.9fr 1fr;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.025);
          margin-bottom: 8px;
          align-items: center;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .t-row:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(232,121,249,0.2);
          transform: translateX(3px);
        }

        .t-row.top1 { border-color: rgba(255,215,0,0.25); background: rgba(255,215,0,0.04); }
        .t-row.top2 { border-color: rgba(192,192,192,0.2); }
        .t-row.top3 { border-color: rgba(205,127,50,0.2); background: rgba(205,127,50,0.03); }

        .rank-num {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
        }

        .c-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .c-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .score-big {
          font-size: 20px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
        }

        .score-sub {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .progress-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .progress-track {
          height: 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
        }

        .cat-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
        }

        /* CRITERIA SECTION */
        .criteria-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .criteria-row {
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          margin-bottom: 10px;
        }

        .criteria-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .criteria-bars {
          display: flex;
          gap: 6px;
          align-items: flex-end;
          height: 50px;
        }

        .c-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          height: 100%;
        }

        .c-bar-fill {
          width: 100%;
          border-radius: 4px;
          min-height: 4px;
        }

        .c-bar-label {
          font-size: 9px;
          color: var(--text-muted);
        }

        /* PRINT STYLES */
        @media print {
          body { background: white !important; color: #000 !important; }
          .no-print { display: none !important; }
          .shell { padding: 10px; }
          .t-row:hover { transform: none; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .podium-section { grid-template-columns: 1fr; }
          .charts-row { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 760px) {
          .shell { padding: 14px; }
          .stats-row { grid-template-columns: 1fr 1fr; }
          .charts-row { grid-template-columns: 1fr; }
          .podium-stage { grid-template-columns: 1fr; }
          .t-head { display: none; }
          .t-row { grid-template-columns: 1fr 1fr; row-gap: 10px; }
          .header { grid-template-columns: 1fr; }
          .tabs { overflow-x: auto; }
          .criteria-section { grid-template-columns: 1fr; }
        }

        .fade-in {
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="shell">
        {/* HEADER */}
        <div className="header">
          <div>
            <div className="header-event">🎭 SLIIT's Got Talent 2026</div>
            <h1 className="header-title">Final Result Report</h1>
            <p className="header-sub">
              Competition end report with vote analysis, judge score analysis, final ranking,
              weighted scoring, and visual performance insights for all participants.
            </p>
            <div className="header-meta">
              <span className="pill pill-green"><span className="live-dot"></span>Results Finalized</span>
              <span className="pill pill-blue">📊 {ranked.length} Contestants</span>
              <span className="pill pill-purple">⚖️ 40% Public · 60% Judges</span>
            </div>
          </div>

          <div className="header-actions no-print">
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              ↻ Refresh
            </button>
            <div className="report-meta">
              Generated: {reportDate}<br />{reportTime}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar no-print">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search contestant or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: 180, paddingLeft: 14 }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* TABS */}
        <div className="tabs no-print">
          {["overview", "charts", "criteria", "ranking"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "📋 Overview"}
              {tab === "charts" && "📊 Charts"}
              {tab === "criteria" && "🎯 Criteria"}
              {tab === "ranking" && "🏆 Full Ranking"}
            </button>
          ))}
        </div>

        {/* STATS */}
        <section className="stats-row fade-in">
          {[
            { icon: "🏆", label: "Top Score", value: ranked[0]?.weightedScore ?? "—", sub: `${ranked[0]?.name ?? ""} leads` },
            { icon: "🗳️", label: "Total Public Votes", value: totalVotes.toLocaleString(), sub: "Audience participation" },
            { icon: "⭐", label: "Avg Judge Score", value: `${avgJudge}/40`, sub: "Panel evaluation avg" },
            { icon: "👥", label: "Finalists", value: ranked.length, sub: "Competing participants" },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </section>

        {/* OVERVIEW TAB */}
        {(activeTab === "overview" || printing) && (
          <>
            <section className="podium-section fade-in">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">🥇 Top 3 Podium</div>
                  <div className="card-sub">Final weighted score leaders</div>
                </div>
                <div className="card-body">
                  <div className="podium-stage">
                    {[topThree[1], topThree[0], topThree[2]].map((c, i) => {
                      if (!c) return <div key={i} />;
                      const realRank = i === 1 ? 0 : i === 0 ? 1 : 2;
                      return (
                        <div key={c.id} className={`podium-card p${realRank + 1}`}>
                          {realRank === 0 && <span className="crown">👑</span>}
                          <span className="medal">{MEDAL[realRank]}</span>
                          <div className="p-name">{c.name}</div>
                          <div className="p-cat">{c.category}</div>
                          <div className="p-score" style={{ color: RANK_COLORS[realRank] }}>
                            {c.weightedScore}
                          </div>
                          <div className="p-details">
                            Votes: {c.publicVotes}/{c.maxVotes}<br />
                            Judge: {c.judgeScore}/{c.maxJudgeScore}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">📌 Summary</div>
                  <div className="card-sub">Key result highlights</div>
                </div>
                <div className="card-body">
                  <div className="summary-grid">
                    <div className="sum-box">
                      <div className="sum-label">Winner</div>
                      <div className="sum-val">{ranked[0]?.weightedScore}</div>
                      <div className="sum-desc">{ranked[0]?.name} — {ranked[0]?.category}</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Best Judge Mark</div>
                      <div className="sum-val">{Math.max(...ranked.map((c) => c.judgeScore))}/40</div>
                      <div className="sum-desc">Highest panel evaluation</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Most Votes</div>
                      <div className="sum-val">{Math.max(...ranked.map((c) => c.publicVotes))}</div>
                      <div className="sum-desc">Peak audience support</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Score Model</div>
                      <div className="sum-val">40/60</div>
                      <div className="sum-desc">Public 40% · Judge 60%</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* CHARTS TAB */}
        {(activeTab === "charts" || printing) && (
          <section className="charts-row fade-in">
            {/* Vote Bar */}
            <div className="chart-card">
              <div className="chart-title">📊 Public Votes</div>
              <div className="chart-sub">Top 5 by audience votes</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.id}>
                    <div className="bar-num">{c.publicVotes}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.publicPercent}%`,
                          background: `linear-gradient(180deg, ${c.color}, ${c.color}88)`,
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div className="chart-card">
              <div className="chart-title">🍩 Vote Distribution</div>
              <div className="chart-sub">Top 6 share</div>
              <div className="pie-container">
                <div
                  className="donut"
                  style={{
                    background: `conic-gradient(${pieSegments.map((s) =>
                      `${s.color} ${s.start}% ${s.start + s.percent}%`).join(", ")})`,
                  }}
                >
                  <div className="donut-hole">Vote<br />Share</div>
                </div>
                <div className="legend-list">
                  {pieSegments.map((s) => (
                    <div className="legend-row" key={s.id}>
                      <span className="legend-dot" style={{ background: s.color }} />
                      <span className="legend-name">{s.name.split(" ")[0]}</span>
                      <span className="legend-pct">{s.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Sparklines */}
            <div className="chart-card">
              <div className="chart-title">📈 Voting Trends</div>
              <div className="chart-sub">Progress over rounds</div>
              <div className="trend-list">
                {ranked.slice(0, 4).map((c) => (
                  <div className="trend-row" key={c.id}>
                    <div className="trend-info">
                      <div>
                        <div className="trend-name">{c.name}</div>
                        <div className="trend-cat">{c.category}</div>
                      </div>
                      <div className="trend-score">{c.weightedScore}</div>
                    </div>
                    <div className="spark">
                      {c.trend.map((v, i) => (
                        <div
                          key={i}
                          className="spark-bar"
                          style={{
                            height: `${(v / 100) * 40}px`,
                            background: `linear-gradient(180deg, ${c.color}, ${c.color}55)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Judge Bars */}
            <div className="chart-card">
              <div className="chart-title">⭐ Judge Scores</div>
              <div className="chart-sub">Panel evaluation top 5</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.id}>
                    <div className="bar-num">{c.judgeScore}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.judgePercent}%`,
                          background: "linear-gradient(180deg, #38bdf8, #3b82f6)",
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weighted Bars */}
            <div className="chart-card">
              <div className="chart-title">🏆 Final Weighted Score</div>
              <div className="chart-sub">Combined score top 5</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.id}>
                    <div className="bar-num">{c.weightedScore}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.weightedScore}%`,
                          background: "linear-gradient(180deg, #e879f9, #a855f7)",
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Votes vs Judge Scatter-like */}
            <div className="chart-card">
              <div className="chart-title">🔀 Votes vs Judge</div>
              <div className="chart-sub">Comparison all contestants</div>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {ranked.slice(0, 6).map((c) => (
                  <div key={c.id} style={{ fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: "#cbd5e1" }}>
                      <span style={{ fontWeight: 700 }}>{c.name.split(" ")[0]}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", color: c.color }}>{c.weightedScore}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ flex: c.publicPercent, height: 6, borderRadius: 4, background: c.color + "aa" }} />
                      <div style={{ flex: 100 - c.publicPercent, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      <div style={{ flex: c.judgePercent, height: 6, borderRadius: 4, background: "#38bdf8aa" }} />
                      <div style={{ flex: 100 - c.judgePercent, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 2, fontSize: 10, color: "#64748b" }}>
                      <span>Public {c.publicPercent}%</span>
                      <span>Judge {c.judgePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CRITERIA TAB */}
        {(activeTab === "criteria" || printing) && (
          <section className="criteria-section fade-in">
            {ranked.slice(0, 8).map((c) => (
              <div key={c.id} className="criteria-row">
                <div className="criteria-top">
                  <span>{c.name} <span style={{ fontWeight: 400, color: "#64748b", fontSize: 12 }}>({c.category})</span></span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: c.color }}>{c.judgeScore}/40</span>
                </div>
                <div className="criteria-bars">
                  {[
                    { label: "C", value: c.creativity, color: "#e879f9" },
                    { label: "P", value: c.presentation, color: "#38bdf8" },
                    { label: "S", value: c.skill, color: "#4ade80" },
                    { label: "A", value: c.audienceImpact, color: "#fb923c" },
                  ].map((cr) => (
                    <div className="c-bar-wrap" key={cr.label}>
                      <div
                        className="c-bar-fill"
                        style={{
                          height: `${(cr.value / 10) * 45}px`,
                          background: `linear-gradient(180deg, ${cr.color}, ${cr.color}55)`,
                        }}
                      />
                      <div className="c-bar-label">{cr.label}{cr.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                  C=Creativity · P=Presentation · S=Skill · A=Audience Impact
                </div>
              </div>
            ))}
          </section>
        )}

        {/* RANKING TABLE */}
        {(activeTab === "ranking" || activeTab === "overview" || printing) && (
          <div className="table-wrap fade-in">
            <div className="table-controls">
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>🏆 Full Ranking Report</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Final weighted score — 40% public votes + 60% judge marks
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                {ranked.length} contestants · Generated {reportDate}
              </div>
            </div>

            <div className="t-head">
              <div>Rank</div>
              <div>Contestant</div>
              <div>Public Votes</div>
              <div>Judge Score</div>
              <div>Final Score</div>
              <div>Category</div>
              <div>Progress</div>
            </div>

            {ranked.map((c, i) => (
              <div
                className={`t-row ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}
                key={c.id}
              >
                <div>
                  <div className="rank-num" style={i < 3 ? { color: RANK_COLORS[i], borderColor: RANK_COLORS[i] + "44" } : {}}>
                    {i < 3 ? MEDAL[i] : i + 1}
                  </div>
                </div>

                <div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-sub">Public {c.publicPercent}% · Judge {c.judgePercent}%</div>
                </div>

                <div>
                  <div className="score-big">{c.publicVotes}</div>
                  <div className="score-sub">/ {c.maxVotes} votes</div>
                </div>

                <div>
                  <div className="score-big">{c.judgeScore}</div>
                  <div className="score-sub">/ {c.maxJudgeScore} pts</div>
                </div>

                <div>
                  <div className="score-big" style={{ color: c.color }}>{c.weightedScore}</div>
                  <div className="score-sub">weighted final</div>
                </div>

                <div>
                  <span className="cat-badge">{c.category}</span>
                </div>

                <div className="progress-cell">
                  <div className="progress-labels">
                    <span>0</span>
                    <span>{c.weightedScore}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${c.weightedScore}%` }} />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: "rgba(232,121,249,0.05)", border: "1px solid rgba(232,121,249,0.12)", fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
              <strong style={{ color: "#f1f5f9" }}>Scoring Methodology:</strong> Final weighted score = (Public Votes / Max Votes × 100) × 0.40 + (Judge Score / Max Judge Score × 100) × 0.60. All scores are normalized to a 100-point scale for fair comparison across categories.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
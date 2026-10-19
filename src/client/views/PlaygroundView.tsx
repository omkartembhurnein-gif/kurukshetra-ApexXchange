import React, { useState } from 'react';
import {
  Bot,
  Play,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  LockKeyhole,
  CheckCircle,
  ExternalLink,
  BookOpen,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { Agent, RunResult } from '../types.ts';
import { HumanApprovalModal } from '../components/HumanApprovalModal.tsx';

interface PlaygroundViewProps {
  agents: Agent[];
  network: string;
  mode: string;
  onRefreshData: () => void;
  onToast: (msg: string) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  agents,
  network,
  mode,
  onRefreshData,
  onToast,
}) => {
  const [task, setTask] = useState(
    'Find three cheap books, convert their prices to INR, and summarize them in Hindi.'
  );
  const [budget, setBudget] = useState('0.0200');
  const [humanApprovalMode, setHumanApprovalMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [error, setError] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Ready-Made Demo Scenarios
  const demoScenarios = [
    {
      title: 'Preset 1: Hackathon Books & Hindi Scribe',
      task: 'Find three cheap books, convert their prices to INR, and summarize them in Hindi.',
      budget: '0.0200',
      tag: 'Triple Chain',
    },
    {
      title: 'Preset 2: Tech Books, EUR Rates & French Scribe',
      task: 'Search 2 top tech books on books.toscrape.com, convert prices to EUR with European FX rates, and generate an executive summary in French.',
      budget: '0.0250',
      tag: 'EUR FX & French',
    },
    {
      title: 'Preset 3: Literature & Schema Sanitization',
      task: 'Extract 3 popular literature releases, check USD/JPY rate, and sanitize structured fields against strict JSON schema.',
      budget: '0.0150',
      tag: 'Data Sanitizer',
    },
  ];

  // Calculate pre-flight quote estimate
  const estimatedCost = 0.007; // Standard 3-call chain quote

  const handleLaunch = async (isApproved = false) => {
    setError('');

    // If Human Approval is on and not yet approved
    if (humanApprovalMode && !isApproved) {
      setShowApprovalModal(true);
      return;
    }

    setRunning(true);
    setRunResult(null);
    setProgressStage(1);

    // Dynamic stage ticker
    const ticker = setInterval(() => {
      setProgressStage((prev) => (prev < 8 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          budget: Number(budget),
          network,
          mode: mode as any,
          humanApprovalRequested: isApproved,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Task execution failed');
      }

      setRunResult(data);
      setProgressStage(9);
      onToast('Task executed successfully! Output verified against registered schemas.');
      onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Scout execution encountered an error');
      onRefreshData();
    } finally {
      clearInterval(ticker);
      setRunning(false);
      setShowApprovalModal(false);
    }
  };

  const timelineSteps = [
    { id: 'received', label: 'Task Received & Parsed' },
    { id: 'planning', label: 'Capability Routing' },
    { id: 'registry', label: 'Registry Discovery' },
    { id: 'budget', label: 'Smart Budget Guard Check' },
    { id: 'scrape', label: 'Atlas Web Scraper Agent' },
    { id: 'data', label: 'Institutional FX Oracle Agent' },
    { id: 'inference', label: 'Hindi Scribe AI Inference' },
    { id: 'validation', label: 'AI Result JSON Schema Check' },
    { id: 'complete', label: 'Research Report Synthesis' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> AUTONOMOUS BUYER AGENT
          </div>
          <h1 className="page-title">
            Natural-Language <span>Task Executor</span>
          </h1>
          <p className="page-subtitle">
            Enter any research or processing goal in plain language. Scout plans the multi-agent chain, checks spending limits,
            verifies JSON schemas, and settles transactions per call.
          </p>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Form & Budget Guard */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 18,
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--accent-lime-dim)',
                  color: 'var(--accent-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ fontSize: 14 }}>Scout Autonomous Orchestrator</strong>
                <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                  Multi-agent capability planner
                </div>
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--accent-lime)',
                padding: '3px 8px',
                borderRadius: 6,
                background: 'var(--accent-lime-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span className="pulse-dot" style={{ width: 5, height: 5 }} /> READY
            </span>
          </div>

          {/* Task Prompt Area */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: 1,
                color: 'var(--text-sub)',
                marginBottom: 8,
              }}
            >
              WHAT SHOULD SCOUT ACCOMPLISH?
            </label>
            <textarea
              rows={4}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Find three cheap books, convert their prices to INR, and summarize them in Hindi."
              style={{
                width: '100%',
                padding: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.6,
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {/* Preset Task Buttons */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-sub)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--accent-lime)' }} /> READY-MADE DEMO SCENARIOS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {demoScenarios.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTask(demo.task);
                    setBudget(demo.budget);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    fontSize: 12,
                  }}
                >
                  <span>{demo.title}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--accent-cyan)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {demo.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Budget Guard Settings */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LockKeyhole size={15} style={{ color: 'var(--accent-lime)' }} />
                <strong style={{ fontSize: 13 }}>Smart Budget Guard</strong>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                PRE-FLIGHT PROTECTION
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                  MAXIMUM SPENDING LIMIT (USDC)
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    marginTop: 4,
                  }}
                >
                  <DollarSign size={13} style={{ color: 'var(--text-sub)' }} />
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="1.0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>USDC</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                  ESTIMATED QUOTES
                </label>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginTop: 4,
                  }}
                >
                  <strong style={{ fontSize: 13, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                    ${estimatedCost.toFixed(4)} USDC
                  </strong>
                  <span style={{ fontSize: 10, color: 'var(--text-sub)', marginLeft: 6 }}>· 3 agents</span>
                </div>
              </div>
            </div>

            {/* Human Approval Mode Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Human Approval Gate</div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>
                  Require manual signature before authorizing testnet settlement
                </div>
              </div>
              <input
                type="checkbox"
                checked={humanApprovalMode}
                onChange={(e) => setHumanApprovalMode(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-lime)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--accent-rose-dim)',
                border: '1px solid var(--accent-rose)',
                color: '#fca5a5',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Submit Action */}
          <button
            className="btn-primary"
            style={{ padding: '14px 20px', fontSize: 14, width: '100%', justifyContent: 'center' }}
            disabled={running || !task.trim()}
            onClick={() => handleLaunch(false)}
          >
            {running ? (
              <>
                <span className="pulse-dot" style={{ width: 8, height: 8 }} /> Scout is orchestrating specialists...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Execute Autonomous Task Chain
              </>
            )}
          </button>
        </div>

        {/* Right Column: Execution Timeline Trace */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Execution Trace</h3>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: running ? 'var(--accent-cyan)' : runResult ? 'var(--accent-lime)' : 'var(--text-sub)',
              }}
            >
              {running ? 'IN PROGRESS' : runResult ? 'COMPLETED' : 'STANDING BY'}
            </span>
          </div>

          <div className="timeline-track">
            {timelineSteps.map((step, idx) => {
              const isDone = runResult || (running && idx < progressStage);
              const isActive = running && idx === progressStage;

              return (
                <div key={step.id} className="timeline-node">
                  <div className={`timeline-dot ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                    {isDone ? <CheckCircle size={12} /> : idx + 1}
                  </div>
                  <strong style={{ fontSize: 12, color: isDone ? 'var(--text-main)' : 'var(--text-sub)' }}>
                    {step.label}
                  </strong>
                  {runResult?.events.find((e) => e.stage === step.id) && (
                    <div style={{ fontSize: 11, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                      {runResult.events.find((e) => e.stage === step.id)?.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 11,
              color: 'var(--text-sub)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--accent-lime)' }} />
            Each response is validated against registered JSON Schemas before release.
          </div>
        </div>
      </div>

      {/* FINAL REPORT SECTION (Visible when execution finishes) */}
      {runResult && (
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 18,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="page-eyebrow">
                <CheckCircle size={14} style={{ color: 'var(--accent-lime)' }} /> VALIDATED RESEARCH REPORT #{runResult.id}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>Multi-Agent Execution Complete</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Scout coordinated {runResult.selected.length} specialist agents. All outputs verified against registered
                schemas.
              </p>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(183, 243, 107, 0.12)',
                color: 'var(--accent-lime)',
                border: '1px solid rgba(183, 243, 107, 0.3)',
              }}
            >
              {runResult.paid ? 'x402 TESTNET SETTLED' : 'DEMO VERIFIED SETTLEMENT'}
            </div>
          </div>

          {/* Scraped Books Cards */}
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginBottom: 10 }}>
              EXTRACTED BOOKS DATA WITH LIVE CONVERSION
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {runResult.books.map((book, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      #0{idx + 1}
                    </span>
                    <strong style={{ fontSize: 15, color: 'var(--accent-lime)' }}>
                      ₹{book.priceINR?.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{book.title}</h4>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                      Original: {book.price} · {book.rating} Stars Acclaim
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                    {book.description}
                  </p>

                  <a
                    href={book.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11, color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    View Source Webpage <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Oracle FX & Hindi Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            {/* Oracle FX Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginBottom: 8 }}>
                  INSTITUTIONAL FX ORACLE
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: 4 }}>
                  ₹{runResult.exchangeRate.gbpToInr.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>1 GBP = ₹{runResult.exchangeRate.gbpToInr.toFixed(2)} INR</div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>
                  USD/INR: ₹{runResult.exchangeRate.rate.toFixed(2)} · USD/EUR: €{runResult.exchangeRate.usdToEur.toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 14 }}>
                Source: {runResult.exchangeRate.source}
              </div>
            </div>

            {/* Summarizer Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                  SYNTHESIZED SUMMARY
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-lime)',
                    background: 'var(--accent-lime-dim)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {runResult.summarizer}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: '#e2e8f0',
                  whiteSpace: 'pre-line',
                }}
              >
                {runResult.summary}
              </p>
            </div>
          </div>

          {/* Hired Agents & Ledger Receipts */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginBottom: 12 }}>
              HIRED SPECIALISTS & ON-CHAIN TESTNET RECEIPTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {runResult.settlementReceipts.map((receipt, idx) => {
                const agent = runResult.selected[idx] || runResult.selected[0];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <strong>{agent?.name || 'Agent'}</strong>{' '}
                      <span style={{ color: 'var(--text-sub)' }}>({agent?.category})</span>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>
                        {agent?.reason}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                        ${receipt.amount.toFixed(4)} USDC
                      </strong>
                      <div style={{ fontSize: 10 }}>
                        <a
                          href={receipt.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          Tx: {receipt.txHash.slice(0, 8)}... <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Spend Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <strong style={{ fontSize: 13 }}>Total Settled: ${runResult.spent.toFixed(4)} USDC</strong>
                <span style={{ fontSize: 11, color: 'var(--text-sub)', marginLeft: 8 }}>
                  Budget Saved: ${(Number(budget) - runResult.spent).toFixed(4)} USDC
                </span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                {runResult.paymentNote}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Human Approval Gate Modal */}
      {showApprovalModal && (
        <HumanApprovalModal
          task={task}
          budget={Number(budget)}
          selectedAgents={agents.slice(0, 3)}
          estimate={estimatedCost}
          onApprove={() => handleLaunch(true)}
          onReject={() => setShowApprovalModal(false)}
        />
      )}
    </div>
  );
};

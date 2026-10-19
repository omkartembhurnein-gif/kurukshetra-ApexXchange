import React from 'react';
import {
  Bot,
  Zap,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
  LockKeyhole,
  CheckCircle,
  Database,
  Globe2,
} from 'lucide-react';
import type { Agent, Stats, LedgerRecord } from '../types.ts';

interface OverviewViewProps {
  stats: Stats;
  agents: Agent[];
  activity: LedgerRecord[];
  mode: string;
  network: string;
  onNavigate: (tab: string) => void;
  onSelectAgent: (agent: Agent) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  agents,
  activity,
  mode,
  network,
  onNavigate,
  onSelectAgent,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> AUTONOMOUS AGENT COMMERCE PLATFORM
          </div>
          <h1 className="page-title">
            The Agent Economy, <span>in motion.</span>
          </h1>
          <p className="page-subtitle">
            Delegate specialist multi-agent workflows, enforce budget limits, verify JSON schemas, and settle
            per-call micro-transactions over the x402 v2 protocol.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={() => onNavigate('playground')}>
            <Bot size={16} /> Launch Task Playground
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(183, 243, 107, 0.1)',
              border: '1px solid rgba(183, 243, 107, 0.25)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-lime)',
              marginBottom: 12,
            }}
          >
            <Sparkles size={12} /> PROTOCOL VERSION 2.5 ACTIVE
          </div>
          <h2>
            Discover. Delegate.<br />
            <span>Pay Per Call.</span>
          </h2>
          <p>
            Scout parses natural-language prompts, discovers verified specialists in the registry, enforces strict pre-flight
            spending limits, and settles micropayments automatically.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={() => onNavigate('marketplace')}>
              Explore Marketplace <ArrowRight size={14} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('payments')}>
              Inspect Live Ledger
            </button>
          </div>
        </div>

        {/* Workflow visualization */}
        <div className="flow-diagram">
          <div className="flow-step">
            <div className="flow-step-icon">
              <Bot size={18} />
            </div>
            <strong>Scout</strong>
            <span>Buyer Agent</span>
          </div>
          <div className="flow-arrow">
            <ArrowRight size={14} />
          </div>
          <div className="flow-step">
            <div className="flow-step-icon" style={{ color: 'var(--accent-lime)' }}>
              <Database size={18} />
            </div>
            <strong>Specialists</strong>
            <span>{agents.length} Registered</span>
          </div>
          <div className="flow-arrow">
            <ArrowRight size={14} />
          </div>
          <div className="flow-step">
            <div className="flow-step-icon" style={{ color: 'var(--accent-violet)' }}>
              <ShieldCheck size={18} />
            </div>
            <strong>Verified</strong>
            <span>Schema Checked</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Registered Agents</span>
            <div className="metric-icon-wrap lime">
              <Bot size={16} />
            </div>
          </div>
          <div className="metric-value">{agents.length}</div>
          <div className="metric-note">Available in SQLite registry</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Task Runs</span>
            <div className="metric-icon-wrap cyan">
              <Zap size={16} />
            </div>
          </div>
          <div className="metric-value">{stats.runs}</div>
          <div className="metric-note">Autonomous multi-agent chains</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Service Calls</span>
            <div className="metric-icon-wrap violet">
              <Activity size={16} />
            </div>
          </div>
          <div className="metric-value">{stats.calls}</div>
          <div className="metric-note">Avg latency: {stats.avgLatency}ms</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Recorded Spend</span>
            <div className="metric-icon-wrap amber">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="metric-value">${stats.recordedSpend.toFixed(4)}</div>
          <div className="metric-note">{stats.settledPayments} settled receipts</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Fraud Blocked</span>
            <div className="metric-icon-wrap rose">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="metric-value">{stats.fraudAttemptsBlocked}</div>
          <div className="metric-note">Duplicate authorizations halted</div>
        </div>
      </div>

      {/* Two Column Section: Popular Agents & Live Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Popular Agents */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 16,
            padding: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Popular Specialists</h3>
              <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                Highest trust score and validated execution history
              </p>
            </div>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => onNavigate('marketplace')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`agent-avatar-wrap ${agent.category.replace(/\s+/g, '')}`}>
                    <Bot size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                      {agent.category} · {agent.success_rate}% success · {agent.median_latency_ms}ms
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-lime)' }}>
                    ${agent.price.toFixed(4)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>USDC / call</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 16,
            padding: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Live Activity Feed</h3>
              <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                Real-time verified requests and x402 settlements
              </p>
            </div>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => onNavigate('payments')}>
              Full Ledger
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activity.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="status-pill success">
                    <CheckCircle size={11} /> {item.status}
                  </span>
                  <div>
                    <strong>{item.agent_name || item.agent_id}</strong>
                    <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>
                      {item.latency_ms}ms · {item.tx_hash ? `${item.tx_hash.slice(0, 8)}...` : 'demo'}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-lime)' }}>
                  ${item.amount.toFixed(4)} USDC
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-sub)', fontSize: 12 }}>
                No recorded activity yet. Run a Scout task to populate the ledger.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--bg-card)',
          borderRadius: 12,
          border: '1px solid var(--border-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LockKeyhole size={18} style={{ color: 'var(--accent-lime)' }} />
          <div>
            <strong style={{ fontSize: 13 }}>Safe by Design & Fraud Resistant</strong>
            <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              Strict pre-flight Smart Budget Guard, AI JSON Schema verification, idempotent replay protection, and testnet
              escrow release.
            </p>
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent-cyan)',
            padding: '4px 10px',
            background: 'var(--accent-cyan-dim)',
            borderRadius: 6,
          }}
        >
          {network.includes('84532') ? 'Base Sepolia' : 'Arbitrum Sepolia'}
        </div>
      </div>
    </div>
  );
};

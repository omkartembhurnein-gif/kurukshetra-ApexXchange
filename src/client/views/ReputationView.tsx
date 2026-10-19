import React from 'react';
import {
  Award,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Bot,
  Zap,
} from 'lucide-react';
import type { Agent, ReputationEvent } from '../types.ts';

interface ReputationViewProps {
  agents: Agent[];
  reputationEvents: ReputationEvent[];
  onToast: (msg: string) => void;
}

export const ReputationView: React.FC<ReputationViewProps> = ({
  agents,
  reputationEvents,
  onToast,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> TRUST & RELIABILITY GOVERNANCE
          </div>
          <h1 className="page-title">
            Trust & <span>Reputation System</span>
          </h1>
          <p className="page-subtitle">
            Autonomous SLA scoring with dynamic reputation decay and slashing. Sellers returning invalid JSON schemas or
            failing calls are automatically penalized and de-prioritized by buyer agents.
          </p>
        </div>
      </div>

      {/* Slashing Protocol Rule Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.95), rgba(15, 18, 29, 0.95))',
          border: '1px solid var(--border-card)',
          borderRadius: 16,
          padding: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent-rose-dim)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingDown size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 13, color: 'var(--accent-rose)' }}>-5 Pts Schema Invalidation</strong>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              If a seller returns unusable or malformed JSON failing registered Zod schema.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent-amber-dim)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 13, color: 'var(--accent-amber)' }}>-3 Pts Call Failure / Timeout</strong>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Triggered upon HTTP 5xx errors or connection timeouts exceeding max SLA.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
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
              flexShrink: 0,
            }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <strong style={{ fontSize: 13, color: 'var(--accent-lime)' }}>+1 Pt Verified Execution</strong>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Gradual recovery reward on successful, verified schema output.
            </p>
          </div>
        </div>
      </div>

      {/* Seller Reputation Leaderboard */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Seller Reliability Leaderboard</h3>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
              Real-time rankings based on historical compliance, schema integrity, and median response latency
            </p>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
            {agents.length} SELLERS EVALUATED
          </span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>RANK / SELLER AGENT</th>
                <th>CATEGORY</th>
                <th>REPUTATION SCORE</th>
                <th>SLA TIER</th>
                <th>SUCCESS RATE</th>
                <th>MEDIAN SLA</th>
                <th>INVALID OUTPUTS</th>
                <th>TOTAL CALLS</th>
                <th>FAILED CALLS</th>
                <th>PRICE / CALL</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr key={agent.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 700,
                          color: index === 0 ? 'var(--accent-lime)' : 'var(--text-sub)',
                        }}
                      >
                        #{index + 1}
                      </span>
                      <strong>{agent.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--text-sub)',
                      }}
                    >
                      {agent.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                        {agent.reputation_score}
                      </strong>
                      <div
                        style={{
                          width: 60,
                          height: 6,
                          background: 'var(--bg-card)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${agent.reputation_score}%`,
                            height: '100%',
                            background:
                              agent.reputation_score >= 90
                                ? 'var(--accent-lime)'
                                : agent.reputation_score >= 75
                                ? 'var(--accent-cyan)'
                                : 'var(--accent-amber)',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`sla-badge ${agent.slaGrade}`}>
                      <span className="pulse-dot" style={{ width: 5, height: 5 }} /> {agent.slaGrade}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{agent.success_rate}%</strong>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{agent.median_latency_ms} ms</td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: agent.invalid_outputs > 0 ? 'var(--accent-rose)' : 'var(--text-sub)',
                        fontWeight: agent.invalid_outputs > 0 ? 700 : 400,
                      }}
                    >
                      {agent.invalid_outputs}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{agent.total_calls}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: agent.failed_calls > 0 ? 'var(--accent-amber)' : 'var(--text-sub)' }}>
                    {agent.failed_calls}
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                      ${agent.price.toFixed(4)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reputation & Slashing Audit History */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Slashing & Reputation Penalty Audit Log</h3>
          <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
            Complete audit trail of score decrements and recovery milestones recorded by the governance engine
          </p>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>EVENT ID</th>
                <th>AFFECTED AGENT</th>
                <th>SCORE DELTA</th>
                <th>NEW SCORE</th>
                <th>REASON / PENALTY CLAUSE</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {reputationEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)' }}>#REP-{event.id}</code>
                  </td>
                  <td>
                    <strong>{event.agent_id}</strong>
                  </td>
                  <td>
                    <strong
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: event.change_amount > 0 ? 'var(--accent-lime)' : 'var(--accent-rose)',
                      }}
                    >
                      {event.change_amount > 0 ? `+${event.change_amount}` : event.change_amount}
                    </strong>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{event.new_score}/100</strong>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{event.reason}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {reputationEvents.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-sub)' }}>
                    No penalty events logged. All registered agents maintaining pristine compliance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

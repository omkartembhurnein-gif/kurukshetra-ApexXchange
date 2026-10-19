import React from 'react';
import { AlertCircle, Check, X, ShieldAlert, DollarSign } from 'lucide-react';
import type { Agent } from '../types.ts';

interface HumanApprovalModalProps {
  task: string;
  budget: number;
  selectedAgents: Agent[];
  estimate: number;
  onApprove: () => void;
  onReject: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  task,
  budget,
  selectedAgents,
  estimate,
  onApprove,
  onReject,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--accent-amber-dim)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--accent-amber)',
                letterSpacing: 1,
              }}
            >
              HUMAN APPROVAL GATE REQUIRED
            </span>
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>Authorize Agent Settlement</h2>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
          Human Approval Mode is active. Scout has planned the task and is waiting for your signature before authorizing testnet settlement.
        </p>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginBottom: 4 }}>
            TASK OBJECTIVE
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>"{task}"</div>
        </div>

        {/* Selected Services Breakdown */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', marginBottom: 8 }}>
            HIRED SPECIALIST QUOTES ({selectedAgents.length} SERVICES)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedAgents.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12,
                }}
              >
                <div>
                  <strong>{a.name}</strong> <span style={{ color: 'var(--text-sub)' }}>({a.category})</span>
                </div>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                  ${a.price.toFixed(4)} USDC
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Estimate Meter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            background: 'var(--bg-card)',
            padding: 12,
            borderRadius: 10,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              CONFIGURED BUDGET
            </div>
            <strong style={{ fontSize: 14 }}>${budget.toFixed(4)}</strong>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              ESTIMATED COST
            </div>
            <strong style={{ fontSize: 14, color: 'var(--accent-lime)' }}>
              ${estimate.toFixed(4)}
            </strong>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              REMAINING BUDGET
            </div>
            <strong style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>
              ${(budget - estimate).toFixed(4)}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" onClick={onReject}>
            <X size={15} /> Reject Task
          </button>
          <button className="btn-primary" onClick={onApprove}>
            <Check size={15} /> Approve & Settle Call
          </button>
        </div>
      </div>
    </div>
  );
};

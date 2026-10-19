import React from 'react';
import { X, Code2, ShieldCheck, Check } from 'lucide-react';
import type { Agent } from '../types.ts';

interface SchemaModalProps {
  agent: Agent;
  onClose: () => void;
  onSelect: (agent: Agent) => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ agent, onClose, onSelect }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--accent-lime-dim)',
              color: 'var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            <Code2 size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--accent-lime)',
                letterSpacing: 1,
              }}
            >
              REGISTERED AGENT SPECIFICATION
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{agent.name}</h2>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
          {agent.description}
        </p>

        {/* Technical Attributes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            background: 'var(--bg-card)',
            padding: 14,
            borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              SERVICE ENDPOINT
            </div>
            <strong style={{ fontSize: 13, color: 'var(--accent-cyan)' }}>{agent.endpoint}</strong>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              TARIFF IN USDC
            </div>
            <strong style={{ fontSize: 13, color: 'var(--accent-lime)' }}>
              ${agent.price.toFixed(4)} USDC / call
            </strong>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              SETTLEMENT NETWORK
            </div>
            <strong style={{ fontSize: 12 }}>{agent.network}</strong>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              SELLER PAYOUT WALLET
            </div>
            <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {agent.pay_to ? `${agent.pay_to.slice(0, 8)}...${agent.pay_to.slice(-6)}` : 'Demo Configured'}
            </code>
          </div>
        </div>

        {/* Schemas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-sub)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} /> INPUT JSON SCHEMA
            </div>
            <pre
              style={{
                background: 'var(--bg-card)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto',
                maxHeight: 140,
              }}
            >
              {JSON.stringify(agent.inputSchema, null, 2)}
            </pre>
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-sub)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--accent-lime)' }} /> OUTPUT JSON SCHEMA
            </div>
            <pre
              style={{
                background: 'var(--bg-card)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto',
                maxHeight: 140,
              }}
            >
              {JSON.stringify(agent.outputSchema, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSelect(agent);
              onClose();
            }}
          >
            <Check size={15} /> Select for Scout Task
          </button>
        </div>
      </div>
    </div>
  );
};

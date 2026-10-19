import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Bot,
  GitBranch,
  Wallet,
  Award,
  ExternalLink,
  BookOpen,
  Code2,
  CheckCircle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  agentCount: number;
  network: string;
  mode: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setTab,
  agentCount,
  network,
  mode,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview / Home', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Agent Marketplace', icon: Compass, count: agentCount },
    { id: 'playground', label: 'Task Playground', icon: Bot },
    { id: 'trace', label: 'Execution Trace', icon: GitBranch },
    { id: 'payments', label: 'Payments & Ledger', icon: Wallet },
    { id: 'reputation', label: 'Trust & Reputation', icon: Award },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-icon">◒</div>
        <div className="brand-title">
          <strong>
            agent<span>x</span>change
          </strong>
          <span>AUTONOMOUS COMMERCE</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-section-title">WORKSPACE</div>
      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.count !== undefined && <span className="nav-pill">{item.count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="nav-section-title" style={{ marginTop: 24 }}>
        DEVELOPER TOOLS
      </div>
      <div className="nav-list">
        <a
          href="https://sepolia.basescan.org"
          target="_blank"
          rel="noreferrer"
          className="nav-button"
        >
          <ExternalLink size={15} />
          <span>Basescan Explorer</span>
        </a>
        <a
          href="https://docs.x402.org"
          target="_blank"
          rel="noreferrer"
          className="nav-button"
        >
          <BookOpen size={15} />
          <span>x402 Protocol Specs</span>
        </a>
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div className="network-badge-box">
          <div className="network-badge-top">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} /> ACTIVE NETWORK
            </span>
            <span>TESTNET</span>
          </div>
          <div className="network-badge-name">
            <span style={{ color: 'var(--accent-cyan)' }}>◒</span>{' '}
            {network.includes('84532') ? 'Base Sepolia' : 'Arbitrum Sepolia'}
          </div>
          <div className="network-badge-note">
            {mode === 'live' ? 'x402 v2 Settlement Active' : 'Simulation Sandbox · 0 Gas'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: 'var(--bg-card)',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent-lime-dim)',
              color: 'var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            S
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Scout Buyer Agent</div>
            <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>Autonomous Orchestrator</div>
          </div>
          <CheckCircle size={14} style={{ color: 'var(--accent-lime)' }} />
        </div>
      </div>
    </aside>
  );
};

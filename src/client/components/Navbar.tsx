import React from 'react';
import { Globe2, Wallet, ChevronDown, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  network: string;
  setNetwork: (net: string) => void;
  mode: string;
  onToast: (msg: string) => void;
  currentTab: string;
}

const tabTitles: Record<string, string> = {
  overview: 'Workspace Overview',
  marketplace: 'Agent Marketplace',
  playground: 'Natural-Language Task Playground',
  trace: 'Execution Trace & Workflow Graph',
  payments: 'Live Payments & Ledger',
  reputation: 'Trust & Reputation System',
};

export const Navbar: React.FC<NavbarProps> = ({ network, setNetwork, mode, onToast, currentTab }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-crumb">AgentXchange</span>
        <span className="topbar-crumb">/</span>
        <strong style={{ fontWeight: 700 }}>{tabTitles[currentTab] || 'Workspace'}</strong>
      </div>

      <div className="topbar-right">
        {/* Network Switcher */}
        <div className="network-selector">
          <Globe2 size={14} style={{ color: network.includes('84532') ? '#38bdf8' : '#a855f7' }} />
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="eip155:84532">Base Sepolia (Testnet)</option>
            <option value="eip155:421614">Arbitrum Sepolia (Testnet)</option>
          </select>
          <ChevronDown size={13} style={{ color: 'var(--text-sub)' }} />
        </div>

        {/* Mode Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            background: mode === 'live' ? 'rgba(183, 243, 107, 0.12)' : 'rgba(56, 189, 248, 0.12)',
            color: mode === 'live' ? 'var(--accent-lime)' : 'var(--accent-cyan)',
            border: `1px solid ${mode === 'live' ? 'rgba(183, 243, 107, 0.25)' : 'rgba(56, 189, 248, 0.25)'}`,
          }}
        >
          <span className={`pulse-dot ${mode === 'live' ? '' : 'amber'}`} style={{ width: 6, height: 6 }} />
          {mode === 'live' ? 'LIVE x402 SETTLEMENT' : 'DEMO SANDBOX MODE'}
        </div>

        {/* Wallet Pill */}
        <button
          className="wallet-pill"
          onClick={() =>
            onToast(
              mode === 'live'
                ? 'Base Sepolia buyer wallet connected server-side'
                : 'Sandbox buyer wallet loaded with 100.000 test USDC'
            )
          }
          title="Click to view wallet details"
        >
          <Wallet size={14} />
          <span>100.000 USDC</span>
        </button>
      </div>
    </header>
  );
};

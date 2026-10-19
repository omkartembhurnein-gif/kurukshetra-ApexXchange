import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { SchemaModal } from './components/SchemaModal.tsx';
import { RegisterAgentModal } from './components/RegisterAgentModal.tsx';
import { OverviewView } from './views/OverviewView.tsx';
import { MarketplaceView } from './views/MarketplaceView.tsx';
import { PlaygroundView } from './views/PlaygroundView.tsx';
import { ExecutionTraceView } from './views/ExecutionTraceView.tsx';
import { PaymentsLedgerView } from './views/PaymentsLedgerView.tsx';
import { ReputationView } from './views/ReputationView.tsx';
import type { Agent, Stats, LedgerRecord, FraudLog, ReputationEvent } from './types.ts';
import { CheckCircle, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({
    runs: 0,
    calls: 0,
    recordedSpend: 0,
    avgLatency: 0,
    settledPayments: 0,
    fraudAttemptsBlocked: 0,
    activeAgents: 0,
  });
  const [activity, setActivity] = useState<LedgerRecord[]>([]);
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>([]);
  const [network, setNetwork] = useState<string>('eip155:84532');
  const [mode, setMode] = useState<string>('demo');
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<Agent | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toast, setToast] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const refreshData = async () => {
    try {
      const [agentsRes, statsRes, healthRes, activityRes, ledgerRes, fraudRes, repRes] =
        await Promise.all([
          fetch('/api/agents').then((r) => r.json()),
          fetch('/api/stats').then((r) => r.json()),
          fetch('/api/health').then((r) => r.json()),
          fetch('/api/activity').then((r) => r.json()),
          fetch('/api/ledger').then((r) => r.json()),
          fetch('/api/fraud-logs').then((r) => r.json()),
          fetch('/api/reputation').then((r) => r.json()),
        ]);

      setAgents(agentsRes || []);
      setStats(statsRes || {});
      setMode(healthRes?.mode || 'demo');
      setActivity(activityRes || []);
      setLedger(ledgerRes || []);
      setFraudLogs(fraudRes || []);
      setReputationEvents(repRes?.slashingEvents || []);
    } catch (err) {
      console.error('Failed to refresh data from server:', err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        agentCount={agents.length}
        network={network}
        mode={mode}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          network={network}
          setNetwork={(net) => {
            setNetwork(net);
            showToast(`Switched active settlement network to ${net.includes('84532') ? 'Base Sepolia' : 'Arbitrum Sepolia'}`);
          }}
          mode={mode}
          onToast={showToast}
          currentTab={currentTab}
        />

        <main className="content-body">
          {currentTab === 'overview' && (
            <OverviewView
              stats={stats}
              agents={agents}
              activity={activity}
              mode={mode}
              network={network}
              onNavigate={setCurrentTab}
              onSelectAgent={setSelectedAgentForModal}
            />
          )}

          {currentTab === 'marketplace' && (
            <MarketplaceView
              agents={agents}
              onSelectAgent={setSelectedAgentForModal}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onTryInPlayground={(agent) => {
                setCurrentTab('playground');
                showToast(`Scout configured to utilize ${agent.name} in next research run!`);
              }}
            />
          )}

          {currentTab === 'playground' && (
            <PlaygroundView
              agents={agents}
              network={network}
              mode={mode}
              onRefreshData={refreshData}
              onToast={showToast}
            />
          )}

          {currentTab === 'trace' && <ExecutionTraceView />}

          {currentTab === 'payments' && (
            <PaymentsLedgerView
              ledger={ledger}
              fraudLogs={fraudLogs}
              network={network}
              onRefresh={refreshData}
              onToast={showToast}
            />
          )}

          {currentTab === 'reputation' && (
            <ReputationView
              agents={agents}
              reputationEvents={reputationEvents}
              onToast={showToast}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="footer-bar">
          <div>
            <strong>AgentXchange</strong> · Autonomous AI Agent Marketplace & Natural-Language Task Executor
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>TESTNET ONLY · ZERO REAL FUNDS REQUIRED</span>
            <a href="https://docs.x402.org" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              x402 v2 Protocol <ExternalLink size={10} />
            </a>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {selectedAgentForModal && (
        <SchemaModal
          agent={selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)}
          onSelect={(agent) => {
            setCurrentTab('playground');
            showToast(`Selected ${agent.name} for task execution!`);
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterAgentModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            refreshData();
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <CheckCircle size={16} style={{ color: 'var(--accent-lime)' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

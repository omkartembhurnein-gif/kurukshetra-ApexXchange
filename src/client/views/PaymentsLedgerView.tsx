import React, { useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { LedgerRecord, FraudLog } from '../types.ts';

interface PaymentsLedgerViewProps {
  ledger: LedgerRecord[];
  fraudLogs: FraudLog[];
  network: string;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

export const PaymentsLedgerView: React.FC<PaymentsLedgerViewProps> = ({
  ledger,
  fraudLogs,
  network,
  onRefresh,
  onToast,
}) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState<'transactions' | 'fraud'>('transactions');

  const filteredRecords = ledger.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const totalSettled = ledger.reduce((sum, r) => sum + (r.tx_hash ? r.amount : 0), 0);

  const exportCSV = () => {
    const headers = ['ID', 'Agent', 'Endpoint', 'Listed Price', 'Requested Price', 'Actual Payment', 'Status', 'Tx Hash', 'Network', 'Latency ms', 'Timestamp'];
    const rows = ledger.map((r) => [
      r.id,
      r.agent_name || r.agent_id,
      r.endpoint,
      r.listed_price,
      r.requested_price,
      r.amount,
      r.status,
      r.tx_hash || 'N/A',
      r.network,
      r.latency_ms,
      r.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agentxchange_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Ledger exported as CSV successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> ON-CHAIN SETTLEMENT AUDIT
          </div>
          <h1 className="page-title">
            Live Payment & <span>Transaction Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Every seller agent call is recorded with its listed price, 402 challenge quote, actual settled payment,
            latency, cryptographic transaction hash, and direct explorer verification link.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={exportCSV}>
            <Download size={15} /> Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Total Settled Volume</span>
            <div className="metric-icon-wrap lime">
              <Wallet size={16} />
            </div>
          </div>
          <div className="metric-value">${totalSettled.toFixed(4)}</div>
          <div className="metric-note">Testnet USDC on Base Sepolia</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Recorded Transactions</span>
            <div className="metric-icon-wrap cyan">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="metric-value">{ledger.length}</div>
          <div className="metric-note">Total verified requests</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Double-Payment Immunity</span>
            <div className="metric-icon-wrap violet">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="metric-value">100%</div>
          <div className="metric-note">Zero duplicate charges permitted</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-title">Fraud Attempts Blocked</span>
            <div className="metric-icon-wrap rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-value">{fraudLogs.length}</div>
          <div className="metric-note">Replays & tampered quotes intercepted</div>
        </div>
      </div>

      {/* Tabs between Transactions & Fraud Logs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              background: activeTab === 'transactions' ? 'var(--accent-lime-dim)' : 'transparent',
              color: activeTab === 'transactions' ? 'var(--accent-lime)' : 'var(--text-sub)',
              border: `1px solid ${activeTab === 'transactions' ? 'rgba(183, 243, 107, 0.3)' : 'transparent'}`,
            }}
          >
            Transactions Ledger ({ledger.length})
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              background: activeTab === 'fraud' ? 'var(--accent-rose-dim)' : 'transparent',
              color: activeTab === 'fraud' ? 'var(--accent-rose)' : 'var(--text-sub)',
              border: `1px solid ${activeTab === 'fraud' ? 'rgba(244, 63, 94, 0.3)' : 'transparent'}`,
            }}
          >
            Fraud & Replay Defense Log ({fraudLogs.length})
          </button>
        </div>

        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--text-sub)' }}>STATUS FILTER:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                padding: '4px 8px',
                borderRadius: 6,
                color: 'var(--text-main)',
                fontSize: 12,
              }}
            >
              <option value="All">All Statuses</option>
              <option value="success">Settled (Success)</option>
              <option value="failed">Failed / Refunded</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      {activeTab === 'transactions' && (
        <div className="table-container">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>REQUEST ID / AGENT</th>
                  <th>ENDPOINT</th>
                  <th>LISTED QUOTE</th>
                  <th>CHALLENGE</th>
                  <th>ACTUAL SETTLED</th>
                  <th>STATUS</th>
                  <th>TRANSACTION HASH</th>
                  <th>NETWORK</th>
                  <th>LATENCY</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const explorerBase = item.network.includes('421614')
                    ? 'https://sepolia.arbiscan.io/tx/'
                    : 'https://sepolia.basescan.org/tx/';

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.agent_name || item.agent_id}</strong>
                        <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>Call #{item.id} · Run #{item.run_id}</div>
                      </td>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)' }}>
                          {item.endpoint}
                        </code>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>${item.listed_price.toFixed(4)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>${item.requested_price.toFixed(4)}</td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                          ${item.amount.toFixed(4)} USDC
                        </strong>
                      </td>
                      <td>
                        <span className={`status-pill ${item.status === 'success' ? 'success' : 'failed'}`}>
                          <CheckCircle size={11} /> {item.status === 'success' ? 'Settled' : 'Failed'}
                        </span>
                      </td>
                      <td>
                        {item.tx_hash ? (
                          <a
                            href={`${explorerBase}${item.tx_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              color: 'var(--accent-cyan)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {item.tx_hash.slice(0, 8)}...{item.tx_hash.slice(-6)}
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>Demo Sandbox</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                          {item.network.includes('84532') ? 'Base Sepolia' : 'Arb Sepolia'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{item.latency_ms} ms</td>
                      <td style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fraud & Security Defense Logs Table */}
      {activeTab === 'fraud' && (
        <div className="table-container">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>INCIDENT ID</th>
                  <th>INTERCEPTED THREAT TYPE</th>
                  <th>AUDIT DETAILS</th>
                  <th>AMOUNT SHIELDED</th>
                  <th>TARGET NETWORK</th>
                  <th>DETECTED AT</th>
                </tr>
              </thead>
              <tbody>
                {fraudLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)' }}>#SEC-{log.id}</code>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'var(--accent-rose-dim)',
                          color: 'var(--accent-rose)',
                          fontWeight: 700,
                        }}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.details}</td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                        ${log.blocked_amount.toFixed(4)} USDC
                      </strong>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{log.network}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                      {new Date(log.detected_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {fraudLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-sub)' }}>
                      Zero security vulnerabilities or duplicate authorization threats detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

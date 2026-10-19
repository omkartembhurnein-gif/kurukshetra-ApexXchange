import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle,
  Clock,
  ShieldCheck,
  Bot,
  Database,
  LockKeyhole,
  ArrowRight,
  Code2,
  Zap,
} from 'lucide-react';

export const ExecutionTraceView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('node-scraper');

  const nodes = [
    {
      id: 'node-input',
      title: '1. Natural Language Intent',
      type: 'Ingress',
      status: 'Verified',
      latency: '12ms',
      icon: Bot,
      color: 'var(--accent-cyan)',
      summary: 'Task input parsed: "Find three cheap books, convert their prices to INR, and summarize them in Hindi."',
      payload: {
        rawInput: 'Find three cheap books, convert their prices to INR, and summarize them in Hindi.',
        parsedCategories: ['Scraping', 'Data', 'Inference'],
        targetCurrency: 'INR',
        targetLanguage: 'Hindi',
        booksTarget: 3,
      },
    },
    {
      id: 'node-budget',
      title: '2. Smart Budget Guard',
      type: 'Security Pre-Flight',
      status: 'Passed',
      latency: '4ms',
      icon: LockKeyhole,
      color: 'var(--accent-lime)',
      summary: 'Pre-flight budget calculation: $0.0070 USDC estimate <= $0.0200 USDC ceiling. Authorizing execution.',
      payload: {
        userBudgetLimit: '0.0200 USDC',
        selectedQuotesTotal: '0.0070 USDC',
        preflightStatus: 'APPROVED',
        fundsRemaining: '0.0130 USDC',
      },
    },
    {
      id: 'node-fraud',
      title: '3. Fraud & Replay Guard',
      type: 'Cryptographic Check',
      status: 'Passed',
      latency: '2ms',
      icon: ShieldCheck,
      color: 'var(--accent-violet)',
      summary: 'Nonce auth_run2_8f91 verified. Checked against active memory cache. Zero replay attempts detected.',
      payload: {
        authorizationNonce: 'auth_run2_8f912c4',
        idempotencyVerified: true,
        networkMatch: 'eip155:84532',
        tokenAssetMatch: '0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC)',
      },
    },
    {
      id: 'node-scraper',
      title: '4. Atlas Web Scraper',
      type: 'Specialist Agent Call',
      status: 'Settled',
      latency: '182ms',
      icon: Database,
      color: 'var(--accent-cyan)',
      summary: 'Crawled books.toscrape.com pages 1-4. Filtered 3 five-star rated books with full descriptions.',
      payload: {
        endpoint: '/api/paid/scrape',
        booksExtracted: 3,
        items: [
          { title: "Sophie's World", price: '£15.94', rating: 'Five' },
          { title: 'Thirst', price: '£17.27', rating: 'Five' },
          { title: 'Set Me Free', price: '£17.46', rating: 'Five' },
        ],
        x402TxHash: '0x73b0ae29e98db3181d853755dbf5878854cce6c7e0c9493e58922882eefb8b81',
      },
    },
    {
      id: 'node-oracle',
      title: '5. Institutional FX Oracle',
      type: 'Specialist Agent Call',
      status: 'Settled',
      latency: '91ms',
      icon: Zap,
      color: 'var(--accent-lime)',
      summary: 'Queried live foreign exchange rates. Computed GBP/INR = 126.62. Converted book prices.',
      payload: {
        endpoint: '/api/paid/data',
        usdToInr: 95.08,
        gbpToInr: 126.62,
        convertedPrices: [
          { book: "Sophie's World", inr: '₹2,018' },
          { book: 'Thirst', inr: '₹2,187' },
          { book: 'Set Me Free', inr: '₹2,211' },
        ],
        x402TxHash: '0x1d90a1ed8b1d7c79be63a0230e58bdfd1f4e89c10f8aa5fbb9e93ca525d0e810',
      },
    },
    {
      id: 'node-scribe',
      title: '6. Hindi Scribe AI Inference',
      type: 'Specialist Agent Call',
      status: 'Settled',
      latency: '312ms',
      icon: Bot,
      color: 'var(--accent-violet)',
      summary: 'Translated and contextualized research descriptions into high-level formal Hindi summary.',
      payload: {
        endpoint: '/api/paid/inference',
        targetLanguage: 'Hindi',
        provider: 'Hindi Scribe Deterministic Inference Engine v2.4',
        outputCharacters: 384,
        x402TxHash: '0xea075f6d8a2592129a725dfdec41607a0c09dce75412cc4ed4478c5134167d4b',
      },
    },
    {
      id: 'node-validation',
      title: '7. AI Result Schema Verification',
      type: 'Quality Assurance',
      status: 'Verified',
      latency: '5ms',
      icon: CheckCircle,
      color: 'var(--accent-lime)',
      summary: 'All 3 agent responses validated against registered Zod JSON Schemas. 100% schema compliance.',
      payload: {
        scraperValidation: 'PASSED (valid book array)',
        fxOracleValidation: 'PASSED (positive numeric rates)',
        summarizerValidation: 'PASSED (non-empty Hindi text)',
        reputationReward: '+1 score to all participants',
      },
    },
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[3];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> REAL-TIME WORKFLOW ORCHESTRATION
          </div>
          <h1 className="page-title">
            Execution Trace & <span>Workflow Graph</span>
          </h1>
          <p className="page-subtitle">
            Inspect the complete multi-agent DAG. Follow how data flows from user intent through capability routing,
            pre-flight budget checks, specialist agent calls, and schema verification.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Workflow Node Graph List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {nodes.map((node, index) => {
            const isSelected = selectedNode === node.id;
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                style={{
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border-card)'}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 0 20px rgba(183, 243, 107, 0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--bg-card)',
                      color: node.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{node.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                      {node.type} · {node.summary.slice(0, 55)}...
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(183, 243, 107, 0.12)',
                      color: 'var(--accent-lime)',
                    }}
                  >
                    {node.status}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 4 }}>
                    {node.latency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Payload Inspector */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 18,
            padding: 24,
            position: 'sticky',
            top: 90,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--bg-card)',
                color: activeNode.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Code2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                NODE PAYLOAD INSPECTOR
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeNode.title}</h3>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            {activeNode.summary}
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11,
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>EXECUTION TIME: </span>
              <strong>{activeNode.latency}</strong>
            </div>
            <div
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11,
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>STATUS: </span>
              <strong style={{ color: 'var(--accent-lime)' }}>{activeNode.status}</strong>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-sub)',
                marginBottom: 6,
              }}
            >
              STRUCTURED JSON PAYLOAD
            </div>
            <pre
              style={{
                background: 'var(--bg-card)',
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto',
                maxHeight: 280,
              }}
            >
              {JSON.stringify(activeNode.payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

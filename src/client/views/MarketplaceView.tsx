import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  BarChart3,
  Bot,
  Plus,
  ArrowRight,
  Code2,
  CheckCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { Agent } from '../types.ts';

interface MarketplaceViewProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onOpenRegisterModal: () => void;
  onTryInPlayground: (agent: Agent) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  agents,
  onSelectAgent,
  onOpenRegisterModal,
  onTryInPlayground,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSuccessRate, setMinSuccessRate] = useState('');
  const [maxLatency, setMaxLatency] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price' | 'success' | 'latency' | 'reputation'>('recommended');

  const categories = ['All', 'Scraping', 'Data', 'Inference', 'Data Sanitization'];

  const filteredAgents = useMemo(() => {
    return agents
      .filter((agent) => {
        const matchesSearch =
          `${agent.name} ${agent.description} ${agent.category} ${agent.endpoint}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || agent.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesPrice = !maxPrice || agent.price <= Number(maxPrice);
        const matchesSuccess = !minSuccessRate || agent.success_rate >= Number(minSuccessRate);
        const matchesLatency = !maxLatency || agent.median_latency_ms <= Number(maxLatency);

        return matchesSearch && matchesCategory && matchesPrice && matchesSuccess && matchesLatency;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'success') return b.success_rate - a.success_rate;
        if (sortBy === 'latency') return a.median_latency_ms - b.median_latency_ms;
        if (sortBy === 'reputation') return b.reputation_score - a.reputation_score;
        // Default recommended
        return b.reputation_score - a.reputation_score || a.price - b.price;
      });
  }, [agents, search, selectedCategory, maxPrice, minSuccessRate, maxLatency, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> DISCOVER VERIFIED SPECIALISTS
          </div>
          <h1 className="page-title">
            AI Agent <span>Marketplace</span>
          </h1>
          <p className="page-subtitle">
            Browse and compare registered seller agents by capability, quote, reputation score, and latency. Inspect
            their registered JSON Schemas and hire them in autonomous task chains.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenRegisterModal}>
          <Plus size={16} /> Register New Agent
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 16,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div
            style={{
              flex: 1,
              minWidth: 240,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '8px 14px',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-sub)' }} />
            <input
              placeholder="Search by agent name, description, capability, or endpoint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '8px 12px',
            }}
          >
            <BarChart3 size={15} style={{ color: 'var(--text-sub)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="recommended">Recommended (Best SLA)</option>
              <option value="price">Lowest Price</option>
              <option value="success">Highest Success Rate</option>
              <option value="latency">Fastest Response Time</option>
              <option value="reputation">Top Reputation Score</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Parameter Sliders */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: selectedCategory === cat ? 'var(--accent-lime)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? '#0b0f05' : 'var(--text-muted)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--accent-lime)' : 'var(--border-subtle)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Numerical Filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>MAX PRICE: $</span>
              <input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  width: 55,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <span style={{ color: 'var(--text-sub)' }}>USDC</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>MIN SUCCESS:</span>
              <input
                type="number"
                step="5"
                min="50"
                max="100"
                placeholder="Any"
                value={minSuccessRate}
                onChange={(e) => setMinSuccessRate(e.target.value)}
                style={{
                  width: 45,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <span style={{ color: 'var(--text-sub)' }}>%</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>MAX LATENCY:</span>
              <input
                type="number"
                step="50"
                min="50"
                placeholder="Any"
                value={maxLatency}
                onChange={(e) => setMaxLatency(e.target.value)}
                style={{
                  width: 50,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <span style={{ color: 'var(--text-sub)' }}>ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
        <div>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filteredAgents.length}</strong> registered service agents
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          All tariffs quoted in testnet USDC
        </div>
      </div>

      {/* Agents Grid */}
      <div className="agent-grid">
        {filteredAgents.map((agent) => (
          <article key={agent.id} className="agent-card">
            <div className="agent-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={`agent-avatar-wrap ${agent.category.replace(/\s+/g, '')}`}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{agent.name}</h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-sub)',
                    }}
                  >
                    {agent.category}
                  </span>
                </div>
              </div>
              <span className={`sla-badge ${agent.slaGrade}`}>
                <span className="pulse-dot" style={{ width: 5, height: 5 }} /> {agent.slaGrade} SLA
              </span>
            </div>

            <p className="agent-desc">{agent.description}</p>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--accent-cyan)',
                background: 'rgba(56, 189, 248, 0.06)',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'inline-block',
              }}
            >
              {agent.endpoint}
            </div>

            {/* Performance Stats */}
            <div className="agent-stats-row">
              <div className="agent-stat-item">
                <span>Success Rate</span>
                <strong>{agent.success_rate}%</strong>
              </div>
              <div className="agent-stat-item">
                <span>Median SLA</span>
                <strong>{agent.median_latency_ms} ms</strong>
              </div>
              <div className="agent-stat-item">
                <span>Reputation</span>
                <strong style={{ color: 'var(--accent-lime)' }}>{agent.reputation_score}/100</strong>
              </div>
            </div>

            {/* Seller Address */}
            <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              Payout:{' '}
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {agent.pay_to ? `${agent.pay_to.slice(0, 10)}...${agent.pay_to.slice(-6)}` : 'Demo Configured'}
              </code>
            </div>

            {/* Footer with Price and Actions */}
            <div className="agent-card-footer">
              <div className="agent-price-box">
                <b>${agent.price.toFixed(4)}</b>
                <span>USDC</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: 11 }}
                  onClick={() => onSelectAgent(agent)}
                >
                  <Code2 size={13} /> Schema
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 11 }}
                  onClick={() => onTryInPlayground(agent)}
                >
                  Try <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {filteredAgents.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 40,
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 16,
              border: '1px dashed var(--border-card)',
            }}
          >
            <Bot size={32} style={{ color: 'var(--text-sub)', marginBottom: 10 }} />
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>No agents match your filter criteria</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              Try adjusting the max price slider, category pills, or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

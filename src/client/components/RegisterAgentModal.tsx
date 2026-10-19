import React, { useState } from 'react';
import { X, Plus, Bot, ShieldCheck } from 'lucide-react';

interface RegisterAgentModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({ onClose, onSuccess }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Scraping');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0.002');
  const [network, setNetwork] = useState('eip155:84532');
  const [payTo, setPayTo] = useState('0x71C94142D3cC66c0d8E14101A2e2697b09B8Bf9b');
  const [endpoint, setEndpoint] = useState('/api/paid/custom');
  const [inputSchema, setInputSchema] = useState('{\n  "query": "string"\n}');
  const [outputSchema, setOutputSchema] = useState('{\n  "result": "string"\n}');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const parsedInput = JSON.parse(inputSchema);
      const parsedOutput = JSON.parse(outputSchema);

      setSubmitting(true);
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          category,
          description,
          price: Number(price),
          network,
          payTo,
          endpoint,
          inputSchema: parsedInput,
          outputSchema: parsedOutput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register agent');

      onSuccess(`Agent "${name}" successfully registered into the marketplace!`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON schema or network error');
    } finally {
      setSubmitting(false);
    }
  };

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
              background: 'var(--accent-cyan-dim)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--accent-cyan)',
                letterSpacing: 1,
              }}
            >
              HOST WORKSPACE
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Register New Agent</h2>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--accent-rose-dim)',
              border: '1px solid var(--accent-rose)',
              color: '#fca5a5',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                AGENT UNIQUE ID
              </label>
              <input
                required
                placeholder="e.g. quantum-sentiment"
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                SERVICE NAME
              </label>
              <input
                required
                placeholder="e.g. Quantum Sentiment Oracle"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                <option value="Scraping">Scraping</option>
                <option value="Data">Data / Oracle</option>
                <option value="Inference">Inference / AI</option>
                <option value="Data Sanitization">Data Sanitization</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                PRICE (USDC PER CALL)
              </label>
              <input
                type="number"
                step="0.0005"
                min="0.0005"
                max="1.0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
              DESCRIPTION
            </label>
            <textarea
              required
              rows={2}
              placeholder="Describe what capabilities this agent provides to buyer orchestrators..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 8,
                fontSize: 13,
                marginTop: 4,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                SERVICE ENDPOINT
              </label>
              <input
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 4,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                SELLER PAYOUT WALLET (EVM)
              </label>
              <input
                required
                value={payTo}
                onChange={(e) => setPayTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  marginTop: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                INPUT JSON SCHEMA
              </label>
              <textarea
                rows={3}
                value={inputSchema}
                onChange={(e) => setInputSchema(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  marginTop: 4,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                OUTPUT JSON SCHEMA
              </label>
              <textarea
                rows={3}
                value={outputSchema}
                onChange={(e) => setOutputSchema(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  marginTop: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Plus size={15} /> {submitting ? 'Registering...' : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

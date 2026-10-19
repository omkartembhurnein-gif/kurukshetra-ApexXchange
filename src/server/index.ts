import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { db, initDatabase } from './db.ts';
import { getX402Config, setupX402Middleware } from './x402.ts';
import { executeBuyerTask } from './buyer.ts';
import { ReputationEngine } from './reputation.ts';
import { FraudGuard } from './fraud.ts';
import { EscrowEngine } from './escrow.ts';
import { scrapeBooks } from './sellers/scraper.ts';
import { getCurrencyRates } from './sellers/oracle.ts';
import { summarizeContent } from './sellers/summarizer.ts';
import { sanitizePayload } from './sellers/sanitizer.ts';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '64kb' }));

// Initialize SQLite database
await initDatabase();

// Initialize x402 configuration
const x402Config = getX402Config();
setupX402Middleware(app, x402Config);

/* -------------------------------------------------------------
 * 1. SYSTEM & HEALTH ENDPOINTS
 * ----------------------------------------------------------- */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '2.5.0',
    mode: x402Config.mode,
    network: x402Config.network,
    x402Configured: x402Config.isLiveConfigured,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/stats', (_req, res) => {
  const runsCount: any = db.prepare(`SELECT COUNT(*) as count FROM runs`).get();
  const callsStats: any = db
    .prepare(
      `SELECT COUNT(*) as calls,
              COALESCE(SUM(CASE WHEN tx_hash IS NOT NULL THEN amount ELSE 0 END), 0) as spend,
              COALESCE(AVG(latency_ms), 0) as avgLatency
       FROM calls`
    )
    .get();
  const settledCount: any = db.prepare(`SELECT COUNT(*) as count FROM calls WHERE tx_hash IS NOT NULL`).get();
  const fraudCount: any = db.prepare(`SELECT COUNT(*) as count FROM fraud_logs`).get();
  const activeAgents: any = db.prepare(`SELECT COUNT(*) as count FROM agents WHERE enabled = 1`).get();

  res.json({
    runs: runsCount?.count || 0,
    calls: callsStats?.calls || 0,
    recordedSpend: Number(callsStats?.spend || 0),
    avgLatency: Math.round(Number(callsStats?.avgLatency || 0)),
    settledPayments: settledCount?.count || 0,
    fraudAttemptsBlocked: fraudCount?.count || 0,
    activeAgents: activeAgents?.count || 0,
  });
});

/* -------------------------------------------------------------
 * 2. AGENT MARKETPLACE & REGISTRY ENDPOINTS
 * ----------------------------------------------------------- */
app.get('/api/agents', (_req, res) => {
  const agents = ReputationEngine.getLeaderboard();
  res.json(agents);
});

// Register new agent
app.post('/api/agents', (req, res) => {
  const schema = z.object({
    id: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
    name: z.string().min(3).max(80),
    category: z.string().min(2).max(40),
    description: z.string().min(10).max(500),
    price: z.number().positive().max(1.0),
    network: z.string().default('eip155:84532'),
    payTo: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    endpoint: z.string().min(2),
    inputSchema: z.record(z.any()),
    outputSchema: z.record(z.any()),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid agent payload' });
  }

  const { id, name, category, description, price, network, payTo, endpoint, inputSchema, outputSchema } = parsed.data;

  try {
    db.prepare(`
      INSERT INTO agents (id, name, category, description, price, network, pay_to, endpoint, input_schema, output_schema, reputation_score, success_rate, median_latency_ms, total_calls, failed_calls, invalid_outputs, enabled, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 95, 100, 120, 0, 0, 0, 1, ?)
    `).run(
      id,
      name,
      category,
      description,
      price,
      network,
      payTo || null,
      endpoint,
      JSON.stringify(inputSchema),
      JSON.stringify(outputSchema),
      new Date().toISOString()
    );

    res.status(201).json({ message: 'Agent registered successfully', id });
  } catch (err: any) {
    res.status(409).json({ error: 'Agent with this ID already exists or database error: ' + err.message });
  }
});

/* -------------------------------------------------------------
 * 3. NATURAL-LANGUAGE TASK EXECUTOR & BUYER AGENT
 * ----------------------------------------------------------- */
app.post('/api/run', async (req, res) => {
  const runSchema = z.object({
    task: z.string().min(6).max(2000),
    budget: z.number().positive().max(10.0),
    network: z.string().optional(),
    mode: z.enum(['demo', 'live']).optional(),
    humanApprovalRequested: z.boolean().optional(),
  });

  const parsed = runSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid task input' });
  }

  const { task, budget, network, mode, humanApprovalRequested } = parsed.data;

  try {
    const result = await executeBuyerTask({
      task,
      budget,
      network,
      mode,
      humanApproved: humanApprovalRequested,
    });
    res.json(result);
  } catch (err: any) {
    const isBudgetGuard = err.message.includes('[Smart Budget Guard]');
    res.status(isBudgetGuard ? 402 : 502).json({
      error: err.message || 'Task execution failed',
      budgetGuardBlocked: isBudgetGuard,
    });
  }
});

/* -------------------------------------------------------------
 * 4. PAYMENTS & LEDGER ENDPOINTS
 * ----------------------------------------------------------- */
app.get('/api/ledger', (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const query = `
    SELECT c.*, a.name as agent_name, a.category as agent_category, r.task as run_task
    FROM calls c
    LEFT JOIN agents a ON a.id = c.agent_id
    LEFT JOIN runs r ON r.id = c.run_id
    ORDER BY c.id DESC
    LIMIT ?
  `;
  const records = db.prepare(query).all(limit);
  res.json(records);
});

app.get('/api/activity', (_req, res) => {
  const recent = db
    .prepare(
      `SELECT c.*, a.name as agent_name
       FROM calls c
       LEFT JOIN agents a ON a.id = c.agent_id
       ORDER BY c.id DESC
       LIMIT 15`
    )
    .all();
  res.json(recent);
});

app.get('/api/fraud-logs', (_req, res) => {
  res.json(FraudGuard.getFraudLogs(30));
});

/* -------------------------------------------------------------
 * 5. TRUST & REPUTATION SYSTEM ENDPOINTS
 * ----------------------------------------------------------- */
app.get('/api/reputation', (_req, res) => {
  const leaderboard = ReputationEngine.getLeaderboard();
  const events = ReputationEngine.getReputationHistory(undefined, 30);
  res.json({
    leaderboard,
    slashingEvents: events,
  });
});

/* -------------------------------------------------------------
 * 6. ESCROW PROTOCOL ENDPOINTS
 * ----------------------------------------------------------- */
app.get('/api/escrow', (_req, res) => {
  res.json(EscrowEngine.getEscrowList(20));
});

/* -------------------------------------------------------------
 * 7. INDIVIDUAL SELLER AGENT ENDPOINTS (For Direct Testing)
 * ----------------------------------------------------------- */
app.post('/api/paid/scrape', async (req, res) => {
  try {
    const { pages = 4, count = 3 } = req.body || {};
    const books = await scrapeBooks(Number(pages), Number(count));
    res.json({ books, source: 'books.toscrape.com', scrapedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Scraper failed' });
  }
});

app.post('/api/paid/data', async (_req, res) => {
  try {
    const rates = await getCurrencyRates();
    res.json(rates);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'FX oracle failed' });
  }
});

app.post('/api/paid/inference', async (req, res) => {
  try {
    const { text, language = 'Hindi' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Text field is required' });
    const result = await summarizeContent(text, language);
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Inference failed' });
  }
});

app.post('/api/paid/sanitize', (req, res) => {
  try {
    const { payload } = req.body || {};
    const result = sanitizePayload(payload);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Sanitization failed' });
  }
});

/* -------------------------------------------------------------
 * 8. STATIC PRODUCTION SERVING (Dist fallback)
 * ----------------------------------------------------------- */
const distPath = resolve('./dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🤖 AgentXchange Server active on http://localhost:${PORT}`);
  console.log(`🔗 Mode: ${x402Config.mode.toUpperCase()} (Target: ${x402Config.network})`);
  console.log(`⚡ x402 Protocol v2 Ready · SQLite Storage Initialized`);
  console.log(`=======================================================`);
});

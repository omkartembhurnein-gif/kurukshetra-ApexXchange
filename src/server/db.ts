import initSqlJs from 'sql.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const dbFile = resolve(process.env.DATABASE_PATH || './data/agentxchange.sqlite');
mkdirSync(dirname(dbFile), { recursive: true });

let rawDb: any;

export async function initDatabase() {
  if (rawDb) return rawDb;
  const SQL = await initSqlJs();
  rawDb = new SQL.Database(
    existsSync(dbFile) ? new Uint8Array(readFileSync(dbFile)) : undefined
  );

  // Initialize tables
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      network TEXT NOT NULL,
      pay_to TEXT,
      endpoint TEXT NOT NULL,
      input_schema TEXT NOT NULL,
      output_schema TEXT NOT NULL,
      reputation_score INTEGER DEFAULT 95,
      success_rate INTEGER DEFAULT 100,
      median_latency_ms INTEGER DEFAULT 120,
      total_calls INTEGER DEFAULT 0,
      failed_calls INTEGER DEFAULT 0,
      invalid_outputs INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      budget REAL NOT NULL,
      spent REAL DEFAULT 0,
      mode TEXT NOT NULL,
      network TEXT NOT NULL,
      status TEXT NOT NULL,
      approval_status TEXT DEFAULT 'auto_approved',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      agent_id TEXT NOT NULL,
      endpoint TEXT,
      status TEXT NOT NULL,
      latency_ms INTEGER NOT NULL,
      listed_price REAL NOT NULL,
      requested_price REAL NOT NULL,
      amount REAL NOT NULL,
      tx_hash TEXT,
      network TEXT NOT NULL,
      schema_valid INTEGER DEFAULT 1,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fraud_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      details TEXT NOT NULL,
      blocked_amount REAL NOT NULL,
      network TEXT NOT NULL,
      detected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reputation_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      change_amount INTEGER NOT NULL,
      new_score INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS escrow_contracts (
      id TEXT PRIMARY KEY,
      run_id INTEGER,
      agent_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      tx_lock_hash TEXT,
      tx_release_hash TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  saveDb();
  seedInitialData();
  return rawDb;
}

export function saveDb() {
  if (!rawDb) return;
  const data = rawDb.export();
  writeFileSync(dbFile, Buffer.from(data));
}

export const db = {
  exec: (sql: string) => {
    rawDb.exec(sql);
    saveDb();
  },
  prepare: (sql: string) => ({
    run: (...params: any[]) => {
      rawDb.run(sql, params);
      const res = rawDb.exec('SELECT last_insert_rowid() AS id');
      const id = res[0]?.values[0]?.[0];
      saveDb();
      return { lastInsertRowid: Number(id || 0) };
    },
    all: (...params: any[]) => {
      const s = rawDb.prepare(sql);
      s.bind(params);
      const out: any[] = [];
      while (s.step()) out.push(s.getAsObject());
      s.free();
      return out;
    },
    get: (...params: any[]) => {
      const s = rawDb.prepare(sql);
      s.bind(params);
      const out = s.step() ? s.getAsObject() : undefined;
      s.free();
      return out;
    },
  }),
};

function seedInitialData() {
  const existingAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
  if (existingAgents && existingAgents.count > 0) {
    return;
  }

  const defaultAgents = [
    {
      id: 'atlas-scraper',
      name: 'Atlas Web Scraper',
      category: 'Scraping',
      description: 'High-speed autonomous scraper for public catalog and e-commerce listings with structural parsing.',
      price: 0.002,
      network: 'eip155:84532',
      pay_to: process.env.SELLER_SCRAPER_ADDRESS || '0x71C94142D3cC66c0d8E14101A2e2697b09B8Bf9b',
      endpoint: '/api/paid/scrape',
      input_schema: JSON.stringify({
        type: 'object',
        required: ['pages', 'count'],
        properties: {
          pages: { type: 'number', description: 'Pages to crawl (1-4)' },
          count: { type: 'number', description: 'Maximum books to extract (1-5)' },
        },
      }),
      output_schema: JSON.stringify({
        type: 'object',
        required: ['books', 'source'],
        properties: {
          books: { type: 'array', items: { type: 'object' }, description: 'Extracted book items' },
          source: { type: 'string', description: 'Source origin domain' },
        },
      }),
      reputation_score: 98,
      success_rate: 99,
      median_latency_ms: 185,
      total_calls: 142,
      failed_calls: 1,
      invalid_outputs: 0,
      enabled: 1,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'currency-oracle',
      name: 'Institutional FX Oracle',
      category: 'Data',
      description: 'Cryptographically signed real-time foreign exchange rates for USD, INR, EUR, and GBP with sub-second latency.',
      price: 0.001,
      network: 'eip155:84532',
      pay_to: process.env.SELLER_DATA_ADDRESS || '0x534c071dC519280a5eE42689531Ce97d620Bfc28',
      endpoint: '/api/paid/data',
      input_schema: JSON.stringify({
        type: 'object',
        properties: {
          base: { type: 'string', default: 'USD' },
          target: { type: 'string', default: 'INR' },
        },
      }),
      output_schema: JSON.stringify({
        type: 'object',
        required: ['rate', 'gbpToInr', 'date', 'source'],
        properties: {
          rate: { type: 'number', description: 'USD/INR conversion rate' },
          gbpToInr: { type: 'number', description: 'GBP/INR cross rate' },
          date: { type: 'string', description: 'FX timestamp' },
          source: { type: 'string', description: 'Oracle provider' },
        },
      }),
      reputation_score: 99,
      success_rate: 100,
      median_latency_ms: 95,
      total_calls: 284,
      failed_calls: 0,
      invalid_outputs: 0,
      enabled: 1,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'hindi-scribe',
      name: 'Hindi Scribe Intelligence',
      category: 'Inference',
      description: 'Context-aware multilingual summarizer translating complex market and product reports into natural Hindi.',
      price: 0.004,
      network: 'eip155:84532',
      pay_to: process.env.SELLER_INFERENCE_ADDRESS || '0x8892c9E5336d39572bAcbbC443a90325d97034B9',
      endpoint: '/api/paid/inference',
      input_schema: JSON.stringify({
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'Input text to synthesize' },
          language: { type: 'string', default: 'Hindi' },
        },
      }),
      output_schema: JSON.stringify({
        type: 'object',
        required: ['summary', 'provider'],
        properties: {
          summary: { type: 'string', description: 'Generated Hindi summary text' },
          provider: { type: 'string', description: 'AI inference engine' },
        },
      }),
      reputation_score: 94,
      success_rate: 97,
      median_latency_ms: 310,
      total_calls: 118,
      failed_calls: 3,
      invalid_outputs: 1,
      enabled: 1,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'data-sanitizer',
      name: 'Schema Shield & Sanitizer',
      category: 'Data Sanitization',
      description: 'Automated JSON schema validator, sanitizing unstructured payloads and blocking malformed data.',
      price: 0.0015,
      network: 'eip155:84532',
      pay_to: '0x992Bcd15C9C03DaF719E4A982821E1fa3B3a5214',
      endpoint: '/api/paid/sanitize',
      input_schema: JSON.stringify({
        type: 'object',
        required: ['payload'],
        properties: {
          payload: { type: 'object', description: 'Arbitrary JSON to validate' },
        },
      }),
      output_schema: JSON.stringify({
        type: 'object',
        required: ['valid', 'sanitized'],
        properties: {
          valid: { type: 'boolean' },
          sanitized: { type: 'object' },
        },
      }),
      reputation_score: 96,
      success_rate: 98,
      median_latency_ms: 60,
      total_calls: 89,
      failed_calls: 2,
      invalid_outputs: 0,
      enabled: 1,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'global-translator',
      name: 'Polyglot Research AI',
      category: 'Inference',
      description: 'Translates and condenses global literature into French, German, Japanese, and Spanish with sentiment analysis.',
      price: 0.0035,
      network: 'eip155:421614',
      pay_to: '0x33B10C42Da25679B92d997f394A587383917F4cD',
      endpoint: '/api/paid/translate',
      input_schema: JSON.stringify({
        type: 'object',
        required: ['text', 'targetLang'],
        properties: {
          text: { type: 'string' },
          targetLang: { type: 'string' },
        },
      }),
      output_schema: JSON.stringify({
        type: 'object',
        required: ['translation', 'language'],
        properties: {
          translation: { type: 'string' },
          language: { type: 'string' },
        },
      }),
      reputation_score: 91,
      success_rate: 95,
      median_latency_ms: 290,
      total_calls: 64,
      failed_calls: 3,
      invalid_outputs: 1,
      enabled: 1,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];

  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, category, description, price, network, pay_to, endpoint, input_schema, output_schema, reputation_score, success_rate, median_latency_ms, total_calls, failed_calls, invalid_outputs, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of defaultAgents) {
    insertAgent.run(
      a.id,
      a.name,
      a.category,
      a.description,
      a.price,
      a.network,
      a.pay_to,
      a.endpoint,
      a.input_schema,
      a.output_schema,
      a.reputation_score,
      a.success_rate,
      a.median_latency_ms,
      a.total_calls,
      a.failed_calls,
      a.invalid_outputs,
      a.enabled,
      a.created_at
    );
  }

  // Seed sample initial transactions for dashboard richness
  const seedCalls = [
    {
      run_id: 1,
      agent_id: 'atlas-scraper',
      endpoint: '/api/paid/scrape',
      status: 'success',
      latency_ms: 182,
      listed_price: 0.002,
      requested_price: 0.002,
      amount: 0.002,
      tx_hash: '0x9b4f2c1a8e9d3b7a5f6e1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
      network: 'eip155:84532',
      schema_valid: 1,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      run_id: 1,
      agent_id: 'currency-oracle',
      endpoint: '/api/paid/data',
      status: 'success',
      latency_ms: 91,
      listed_price: 0.001,
      requested_price: 0.001,
      amount: 0.001,
      tx_hash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f9b4f2c1a8e9d3b7a5f6e',
      network: 'eip155:84532',
      schema_valid: 1,
      created_at: new Date(Date.now() - 3600000 * 5 + 200).toISOString(),
    },
    {
      run_id: 1,
      agent_id: 'hindi-scribe',
      endpoint: '/api/paid/inference',
      status: 'success',
      latency_ms: 312,
      listed_price: 0.004,
      requested_price: 0.004,
      amount: 0.004,
      tx_hash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f9b4f2c1a8e9d3b7a5f6e1c2d3e4f',
      network: 'eip155:84532',
      schema_valid: 1,
      created_at: new Date(Date.now() - 3600000 * 5 + 600).toISOString(),
    },
  ];

  const insertCall = db.prepare(`
    INSERT INTO calls (run_id, agent_id, endpoint, status, latency_ms, listed_price, requested_price, amount, tx_hash, network, schema_valid, error_message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of seedCalls) {
    insertCall.run(
      c.run_id,
      c.agent_id,
      c.endpoint,
      c.status,
      c.latency_ms,
      c.listed_price,
      c.requested_price,
      c.amount,
      c.tx_hash,
      c.network,
      c.schema_valid,
      null,
      c.created_at
    );
  }

  // Seed sample initial run
  db.prepare(`
    INSERT INTO runs (id, task, budget, spent, mode, network, status, approval_status, created_at)
    VALUES (1, 'Find three cheap books, convert their prices to INR, and summarize them in Hindi.', 0.02, 0.007, 'demo', 'eip155:84532', 'success', 'auto_approved', ?)
  `).run(new Date(Date.now() - 3600000 * 5).toISOString());

  // Seed sample reputation events
  db.prepare(`
    INSERT INTO reputation_events (agent_id, change_amount, new_score, reason, created_at)
    VALUES ('hindi-scribe', -5, 94, 'Minor schema latency timeout penalty (-5)', ?)
  `).run(new Date(Date.now() - 86400000).toISOString());

  db.prepare(`
    INSERT INTO reputation_events (agent_id, change_amount, new_score, reason, created_at)
    VALUES ('atlas-scraper', 1, 98, 'Milestone: 100 consecutive valid schema responses (+1)', ?)
  `).run(new Date(Date.now() - 86400000 * 2).toISOString());

  // Seed a sample fraud prevention log
  db.prepare(`
    INSERT INTO fraud_logs (type, details, blocked_amount, network, detected_at)
    VALUES ('DUPLICATE_AUTH_REJECTED', 'Blocked replay of authorization nonce #auth_8f912c4 for agent atlas-scraper', 0.002, 'eip155:84532', ?)
  `).run(new Date(Date.now() - 3600000 * 2).toISOString());

  saveDb();
}

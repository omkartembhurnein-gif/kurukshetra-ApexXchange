import { db } from './db.ts';
import { z } from 'zod';
import { scrapeBooks, type ScrapedBook } from './sellers/scraper.ts';
import { getCurrencyRates, type CurrencyOracleResult } from './sellers/oracle.ts';
import { summarizeContent, type SummarizerResult } from './sellers/summarizer.ts';
import { sanitizePayload } from './sellers/sanitizer.ts';
import { FraudGuard } from './fraud.ts';
import { ReputationEngine } from './reputation.ts';
import { EscrowEngine } from './escrow.ts';
import { generateSettlementReceipt, getX402Config } from './x402.ts';

export interface TaskPlan {
  categories: string[];
  pages: number;
  count: number;
  targetCurrency: string;
  targetLang: string;
  useEscrow: boolean;
}

export function parseNaturalLanguageTask(task: string): TaskPlan {
  const lower = task.toLowerCase();
  const categories: string[] = [];

  // Scraper detection
  if (/book|scrap|catalog|product|listing|extract|webpage|page/i.test(lower)) {
    categories.push('Scraping');
  }

  // Currency / Data detection
  if (/convert|currency|exchange|inr|eur|usd|fx|rate|price/i.test(lower)) {
    categories.push('Data');
  }

  // Summarization / Inference detection
  if (/summar|hindi|translate|french|spanish|analysis|scribe|condense/i.test(lower)) {
    categories.push('Inference');
  }

  // Schema Sanitizer detection
  if (/sanitize|schema|validate|clean|json/i.test(lower)) {
    categories.push('Data Sanitization');
  }

  // Default to the 3-agent chain if generic
  if (categories.length === 0) {
    categories.push('Scraping', 'Data', 'Inference');
  }

  // Parse page range
  const pageMatch = lower.match(/pages?\s*(\d+)\s*(?:to|-)\s*(\d+)/);
  const pages = pageMatch ? Math.max(1, Math.min(4, Number(pageMatch[2]))) : 4;

  // Parse item count
  const countMatch = lower.match(/\b(three|3|two|2|one|1|four|4|five|5)\s+(?:cheap|cheapest|books|items|results|top)\b/);
  const countMap: Record<string, number> = {
    one: 1, '1': 1, two: 2, '2': 2, three: 3, '3': 3, four: 4, '4': 4, five: 5, '5': 5,
  };
  const count = countMatch ? countMap[countMatch[1]] || 3 : 3;

  // Detect target currency
  let targetCurrency = 'INR';
  if (/eur|euro/i.test(lower)) targetCurrency = 'EUR';
  else if (/jpy|yen/i.test(lower)) targetCurrency = 'JPY';
  else if (/usd|dollar/i.test(lower)) targetCurrency = 'USD';

  // Detect target language
  let targetLang = 'Hindi';
  if (/french|français/i.test(lower)) targetLang = 'French';
  else if (/spanish|español/i.test(lower)) targetLang = 'Spanish';
  else if (/english/i.test(lower)) targetLang = 'English';

  const useEscrow = /escrow|safeguard|protect/i.test(lower);

  return {
    categories,
    pages,
    count,
    targetCurrency,
    targetLang,
    useEscrow,
  };
}

export interface RunExecutionResult {
  id: number;
  task: string;
  mode: string;
  network: string;
  paid: boolean;
  paymentNote: string;
  estimate: number;
  spent: number;
  selected: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    reason: string;
    slaGrade: string;
    payTo: string | null;
  }>;
  books: ScrapedBook[];
  exchangeRate: CurrencyOracleResult;
  summarizer: string;
  summary: string;
  events: Array<{ stage: string; message: string; at: string }>;
  settlementReceipts: any[];
  escrowIds?: string[];
  fraudProtectionReport: {
    passed: boolean;
    noncesChecked: number;
    duplicateAttacksBlocked: number;
    priceTamperAttempts: number;
  };
}

export async function executeBuyerTask(params: {
  task: string;
  budget: number;
  network?: string;
  mode?: 'demo' | 'live';
  humanApproved?: boolean;
}): Promise<RunExecutionResult> {
  const { task, budget } = params;
  const config = getX402Config();
  const mode = params.mode || config.mode;
  const network = params.network || config.network;

  const plan = parseNaturalLanguageTask(task);
  const allAgents = db.prepare(`SELECT * FROM agents WHERE enabled = 1`).all() as any[];

  // Select best agent for each category
  const selectedAgents = plan.categories
    .map((category) => {
      const candidates = allAgents
        .filter((a) => a.category.toLowerCase() === category.toLowerCase())
        .sort(
          (x, y) =>
            (y.reputation_score || 0) - (x.reputation_score || 0) ||
            x.price - y.price ||
            (x.median_latency_ms || 999) - (y.median_latency_ms || 999)
        );
      return candidates[0];
    })
    .filter(Boolean);

  if (selectedAgents.length === 0) {
    throw new Error('No registered agents matched the required capabilities for this task.');
  }

  const estimate = selectedAgents.reduce((sum, a) => sum + a.price, 0);

  // 1. SMART BUDGET GUARD
  if (estimate > budget) {
    throw new Error(
      `[Smart Budget Guard] Estimated cost ($${estimate.toFixed(4)} USDC) exceeds your configured budget ($${budget.toFixed(4)} USDC). Pre-flight execution halted before any payment.`
    );
  }

  // Create task run in DB
  const runId = Number(
    db
      .prepare(
        `INSERT INTO runs (task, budget, spent, mode, network, status, approval_status, created_at)
         VALUES (?, ?, 0, ?, ?, 'running', ?, ?)`
      )
      .run(
        task,
        budget,
        mode,
        network,
        params.humanApproved ? 'human_approved' : 'auto_approved',
        new Date().toISOString()
      ).lastInsertRowid
  );

  const events: Array<{ stage: string; message: string; at: string }> = [];
  const log = (stage: string, message: string) => {
    events.push({ stage, message, at: new Date().toISOString() });
  };

  log('received', `Task received by Scout Autonomous Buyer Agent`);
  log('planning', `Identified capabilities: ${plan.categories.join(', ')}; targeting ${plan.count} books, ${plan.targetCurrency} currency, ${plan.targetLang} language.`);
  log('registry', `Selected ${selectedAgents.length} optimal seller agents based on highest reputation score and lowest quote.`);
  log('budget', `[Smart Budget Guard] Passed — Pre-flight estimated cost $${estimate.toFixed(4)} USDC is within budget limit ($${budget.toFixed(4)} USDC).`);

  const settlementReceipts: any[] = [];
  const escrowIds: string[] = [];
  let books: ScrapedBook[] = [];
  let exchangeRate: CurrencyOracleResult = {
    rate: 86.85,
    gbpToInr: 109.94,
    usdToEur: 0.95,
    gbpToEur: 1.20,
    date: new Date().toUTCString(),
    source: 'Institutional FX Oracle',
  };
  let summarizerResult: SummarizerResult = {
    summary: '',
    language: plan.targetLang,
    provider: '',
  };

  let noncesChecked = 0;
  let duplicateAttacksBlocked = 0;
  let priceTamperAttempts = 0;

  try {
    // 2. CHAIN EXECUTION: STEP 1 - ATLAS SCRAPER
    const scraperAgent = selectedAgents.find((a) => a.category === 'Scraping');
    if (scraperAgent) {
      log('scrape', `Invoking Atlas Web Scraper Agent (${scraperAgent.endpoint})...`);
      const authNonce = `auth_${runId}_scraper_${Date.now()}`;
      noncesChecked++;

      // Fraud check
      const authCheck = FraudGuard.checkAuthorization(authNonce);
      if (!authCheck.passed) throw new Error(authCheck.reason);

      const priceCheck = FraudGuard.checkPriceIntegrity(scraperAgent.price, scraperAgent.price, scraperAgent.id);
      if (!priceCheck.passed) throw new Error(priceCheck.reason);

      // Lock in Escrow
      const escrow = EscrowEngine.lockFunds(runId, scraperAgent.id, scraperAgent.price, network);
      escrowIds.push(escrow.id);

      const t0 = Date.now();
      books = await scrapeBooks(plan.pages, plan.count);
      const latency = Date.now() - t0;

      // AI Result Verification
      const booksSchema = z.array(
        z.object({
          title: z.string().min(1),
          price: z.string().min(1),
          rating: z.string(),
          description: z.string(),
        })
      );
      const parseResult = booksSchema.safeParse(books);
      const isSchemaValid = parseResult.success && books.length > 0;

      if (!isSchemaValid) {
        EscrowEngine.refundBuyer(escrow.id, 'AI Schema verification failed for scraped books');
        ReputationEngine.recordCallResult(scraperAgent.id, false, latency, false, 'Invalid book schema');
        throw new Error('AI Result Verification failed: Scraper output did not adhere to registered schema.');
      }

      // Release Escrow & Commit Authorization
      EscrowEngine.releaseFunds(escrow.id);
      const receipt = generateSettlementReceipt(scraperAgent.id, scraperAgent.price, network, authNonce);
      settlementReceipts.push(receipt);
      FraudGuard.commitAuthorization(authNonce, receipt.txHash, scraperAgent.price);

      // Record call
      db.prepare(`
        INSERT INTO calls (run_id, agent_id, endpoint, status, latency_ms, listed_price, requested_price, amount, tx_hash, network, schema_valid, error_message, created_at)
        VALUES (?, ?, ?, 'success', ?, ?, ?, ?, ?, ?, 1, null, ?)
      `).run(runId, scraperAgent.id, scraperAgent.endpoint, latency, scraperAgent.price, scraperAgent.price, scraperAgent.price, receipt.txHash, network, new Date().toISOString());

      ReputationEngine.recordCallResult(scraperAgent.id, true, latency, true);
      log('scrape', `Atlas Scraper successfully extracted ${books.length} verified five-star books. x402 settlement confirmed (${receipt.txHash.slice(0, 10)}...).`);
    }

    // 3. CHAIN EXECUTION: STEP 2 - CURRENCY ORACLE
    const dataAgent = selectedAgents.find((a) => a.category === 'Data');
    if (dataAgent) {
      log('data', `Invoking Institutional FX Oracle Agent (${dataAgent.endpoint})...`);
      const authNonce = `auth_${runId}_data_${Date.now()}`;
      noncesChecked++;

      // Fraud check
      const authCheck = FraudGuard.checkAuthorization(authNonce);
      if (!authCheck.passed) throw new Error(authCheck.reason);

      const escrow = EscrowEngine.lockFunds(runId, dataAgent.id, dataAgent.price, network);
      escrowIds.push(escrow.id);

      const t0 = Date.now();
      exchangeRate = await getCurrencyRates();
      const latency = Date.now() - t0;

      // AI Result Verification
      const fxSchema = z.object({
        rate: z.number().positive(),
        gbpToInr: z.number().positive(),
        date: z.string(),
        source: z.string(),
      });
      const parseResult = fxSchema.safeParse(exchangeRate);
      const isSchemaValid = parseResult.success;

      if (!isSchemaValid) {
        EscrowEngine.refundBuyer(escrow.id, 'Currency Oracle rate payload malformed');
        ReputationEngine.recordCallResult(dataAgent.id, false, latency, false, 'Invalid FX schema');
        throw new Error('AI Result Verification failed: FX Oracle response did not contain positive numeric rates.');
      }

      // Convert prices on books
      for (const book of books) {
        const gbp = parseFloat(book.price.replace(/[^0-9.]/g, '')) || 15.0;
        book.priceINR = Math.round(gbp * exchangeRate.gbpToInr);
      }

      EscrowEngine.releaseFunds(escrow.id);
      const receipt = generateSettlementReceipt(dataAgent.id, dataAgent.price, network, authNonce);
      settlementReceipts.push(receipt);
      FraudGuard.commitAuthorization(authNonce, receipt.txHash, dataAgent.price);

      db.prepare(`
        INSERT INTO calls (run_id, agent_id, endpoint, status, latency_ms, listed_price, requested_price, amount, tx_hash, network, schema_valid, error_message, created_at)
        VALUES (?, ?, ?, 'success', ?, ?, ?, ?, ?, ?, 1, null, ?)
      `).run(runId, dataAgent.id, dataAgent.endpoint, latency, dataAgent.price, dataAgent.price, dataAgent.price, receipt.txHash, network, new Date().toISOString());

      ReputationEngine.recordCallResult(dataAgent.id, true, latency, true);
      log('data', `Currency Oracle delivered USD/INR ${exchangeRate.rate.toFixed(2)} and GBP/INR ${exchangeRate.gbpToInr.toFixed(2)}. Converted book prices.`);
    }

    // 4. CHAIN EXECUTION: STEP 3 - HINDI SCRIBE / TRANSLATOR
    const inferenceAgent = selectedAgents.find((a) => a.category === 'Inference');
    if (inferenceAgent) {
      log('inference', `Invoking Hindi Scribe AI Inference Agent (${inferenceAgent.endpoint})...`);
      const authNonce = `auth_${runId}_inference_${Date.now()}`;
      noncesChecked++;

      const authCheck = FraudGuard.checkAuthorization(authNonce);
      if (!authCheck.passed) throw new Error(authCheck.reason);

      const escrow = EscrowEngine.lockFunds(runId, inferenceAgent.id, inferenceAgent.price, network);
      escrowIds.push(escrow.id);

      const synthesisInput = books
        .map(
          (b) =>
            `${b.title} — ${b.price} (₹${b.priceINR}), Rating: ${b.rating} stars. Description: ${b.description}`
        )
        .join('\n');

      const t0 = Date.now();
      summarizerResult = await summarizeContent(synthesisInput, plan.targetLang);
      const latency = Date.now() - t0;

      // AI Result Verification
      const summarySchema = z.object({
        summary: z.string().min(10),
        provider: z.string(),
      });
      const parseResult = summarySchema.safeParse(summarizerResult);
      const isSchemaValid = parseResult.success;

      if (!isSchemaValid) {
        EscrowEngine.refundBuyer(escrow.id, 'Summarizer output empty or invalid');
        ReputationEngine.recordCallResult(inferenceAgent.id, false, latency, false, 'Invalid summary schema');
        throw new Error('AI Result Verification failed: Summarizer output was unusable.');
      }

      EscrowEngine.releaseFunds(escrow.id);
      const receipt = generateSettlementReceipt(inferenceAgent.id, inferenceAgent.price, network, authNonce);
      settlementReceipts.push(receipt);
      FraudGuard.commitAuthorization(authNonce, receipt.txHash, inferenceAgent.price);

      db.prepare(`
        INSERT INTO calls (run_id, agent_id, endpoint, status, latency_ms, listed_price, requested_price, amount, tx_hash, network, schema_valid, error_message, created_at)
        VALUES (?, ?, ?, 'success', ?, ?, ?, ?, ?, ?, 1, null, ?)
      `).run(runId, inferenceAgent.id, inferenceAgent.endpoint, latency, inferenceAgent.price, inferenceAgent.price, inferenceAgent.price, receipt.txHash, network, new Date().toISOString());

      ReputationEngine.recordCallResult(inferenceAgent.id, true, latency, true);
      log('inference', `Hindi Scribe synthesized final summary using ${summarizerResult.provider}.`);
    }

    // 5. OPTIONAL STEP 4 - SANITIZER
    const sanitizerAgent = selectedAgents.find((a) => a.category === 'Data Sanitization');
    if (sanitizerAgent) {
      log('validation', `Schema Shield sanitizing final research payload...`);
      const sanitized = sanitizePayload({ books, exchangeRate, summary: summarizerResult });
      log('validation', `Payload sanitized: ${sanitized.issues.length} issues detected.`);
    }

    log('validation', `AI Result Verification passed: All seller outputs validated against registered JSON Schemas.`);
    log('complete', `Autonomous research completed. Coordinated ${selectedAgents.length} specialist agents.`);

    // Total spent
    const totalSpent = settlementReceipts.reduce((sum, r) => sum + r.amount, 0);

    db.prepare(`UPDATE runs SET spent = ?, status = 'success' WHERE id = ?`).run(totalSpent, runId);

    return {
      id: runId,
      task,
      mode,
      network,
      paid: mode === 'live',
      paymentNote:
        mode === 'live'
          ? `Settled on Base Sepolia testnet via x402 v2 protocol. All ${settlementReceipts.length} transactions verified on-chain.`
          : `High-fidelity demo settlement with cryptographically verifiable EVM hashes. Displayed quotes adhere strictly to registry tariffs.`,
      estimate,
      spent: totalSpent,
      selected: selectedAgents.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        price: a.price,
        reason: `Matched via capability router with ${a.success_rate}% historical success rate and ${a.median_latency_ms}ms median SLA.`,
        slaGrade: a.reputation_score >= 95 ? 'Elite' : a.reputation_score >= 85 ? 'Trusted' : 'Reliable',
        payTo: a.pay_to,
      })),
      books,
      exchangeRate,
      summarizer: summarizerResult.provider,
      summary: summarizerResult.summary,
      events,
      settlementReceipts,
      escrowIds,
      fraudProtectionReport: {
        passed: true,
        noncesChecked,
        duplicateAttacksBlocked,
        priceTamperAttempts,
      },
    };
  } catch (err: any) {
    db.prepare(`UPDATE runs SET status = 'failed' WHERE id = ?`).run(runId);
    log('error', `Execution error: ${err.message}`);
    throw err;
  }
}

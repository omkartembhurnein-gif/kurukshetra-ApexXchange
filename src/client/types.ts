export interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  network: string;
  pay_to: string | null;
  endpoint: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  reputation_score: number;
  success_rate: number;
  median_latency_ms: number;
  total_calls: number;
  failed_calls: number;
  invalid_outputs: number;
  enabled: number;
  slaGrade: 'Elite' | 'Trusted' | 'Reliable' | 'Degraded' | 'Suspended';
}

export interface Stats {
  runs: number;
  calls: number;
  recordedSpend: number;
  avgLatency: number;
  settledPayments: number;
  fraudAttemptsBlocked: number;
  activeAgents: number;
}

export interface ScrapedBook {
  title: string;
  price: string;
  rating: string;
  description: string;
  url: string;
  priceINR?: number;
}

export interface ExchangeRateData {
  rate: number;
  gbpToInr: number;
  usdToEur: number;
  gbpToEur: number;
  date: string;
  source: string;
}

export interface ExecutionEvent {
  stage: string;
  message: string;
  at: string;
}

export interface SettlementReceipt {
  txHash: string;
  network: string;
  explorerUrl: string;
  asset: string;
  amount: number;
  timestamp: string;
}

export interface RunResult {
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
  exchangeRate: ExchangeRateData;
  summarizer: string;
  summary: string;
  events: ExecutionEvent[];
  settlementReceipts: SettlementReceipt[];
  escrowIds?: string[];
  fraudProtectionReport: {
    passed: boolean;
    noncesChecked: number;
    duplicateAttacksBlocked: number;
    priceTamperAttempts: number;
  };
}

export interface LedgerRecord {
  id: number;
  run_id: number;
  agent_id: string;
  agent_name?: string;
  agent_category?: string;
  endpoint: string;
  status: string;
  latency_ms: number;
  listed_price: number;
  requested_price: number;
  amount: number;
  tx_hash: string | null;
  network: string;
  schema_valid: number;
  error_message: string | null;
  created_at: string;
}

export interface FraudLog {
  id: number;
  type: string;
  details: string;
  blocked_amount: number;
  network: string;
  detected_at: string;
}

export interface ReputationEvent {
  id: number;
  agent_id: string;
  change_amount: number;
  new_score: number;
  reason: string;
  created_at: string;
}

export interface EscrowContract {
  id: string;
  run_id: number;
  agent_id: string;
  amount: number;
  status: string;
  tx_lock_hash: string;
  tx_release_hash: string | null;
  created_at: string;
  updated_at: string;
}

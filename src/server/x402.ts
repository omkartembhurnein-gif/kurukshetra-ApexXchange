import { isAddress, keccak256, toHex } from 'viem';
import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { paymentMiddleware } from '@x402/express';
import type { Express } from 'express';

export const BASE_SEPOLIA_CHAIN_ID = 'eip155:84532';
export const ARB_SEPOLIA_CHAIN_ID = 'eip155:421614';
export const TESTNET_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

export interface X402Config {
  mode: 'demo' | 'live';
  network: string;
  isLiveConfigured: boolean;
  facilitatorUrl: string;
}

export function getX402Config(): X402Config {
  const mode = process.env.MODE === 'live' ? 'live' : 'demo';
  const buyerKey = process.env.BUYER_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY;
  const scraperPayTo = process.env.SELLER_SCRAPER_ADDRESS;
  const isLiveConfigured = Boolean(
    mode === 'live' &&
    buyerKey &&
    buyerKey.startsWith('0x') &&
    scraperPayTo &&
    isAddress(scraperPayTo)
  );

  return {
    mode,
    network: process.env.NETWORK || BASE_SEPOLIA_CHAIN_ID,
    isLiveConfigured,
    facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402.org/facilitator',
  };
}

export function setupX402Middleware(app: Express, config: X402Config) {
  if (!config.isLiveConfigured) {
    console.log('[x402] Running in high-fidelity DEMO / SIMULATION mode (Zero testnet gas required)');
    return;
  }

  try {
    const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
    const resourceServer = new x402ResourceServer(facilitator);
    resourceServer.register(BASE_SEPOLIA_CHAIN_ID, new ExactEvmScheme());

    const scraperPayTo = process.env.SELLER_SCRAPER_ADDRESS || '0x71C94142D3cC66c0d8E14101A2e2697b09B8Bf9b';
    const dataPayTo = process.env.SELLER_DATA_ADDRESS || '0x534c071dC519280a5eE42689531Ce97d620Bfc28';
    const inferencePayTo = process.env.SELLER_INFERENCE_ADDRESS || '0x8892c9E5336d39572bAcbbC443a90325d97034B9';

    const protectedRoutes = {
      'POST /api/paid/scrape': {
        accepts: [
          {
            scheme: 'exact',
            price: '$0.002',
            network: BASE_SEPOLIA_CHAIN_ID,
            payTo: scraperPayTo,
          },
        ],
        description: 'Atlas Web Scraper exact payment settlement',
      },
      'POST /api/paid/data': {
        accepts: [
          {
            scheme: 'exact',
            price: '$0.001',
            network: BASE_SEPOLIA_CHAIN_ID,
            payTo: dataPayTo,
          },
        ],
        description: 'Currency Oracle FX query exact payment settlement',
      },
      'POST /api/paid/inference': {
        accepts: [
          {
            scheme: 'exact',
            price: '$0.004',
            network: BASE_SEPOLIA_CHAIN_ID,
            payTo: inferencePayTo,
          },
        ],
        description: 'Hindi Scribe AI inference exact payment settlement',
      },
    };

    app.use(paymentMiddleware(protectedRoutes, resourceServer));
    console.log('[x402] Live x402 v2 payment middleware registered for Base Sepolia endpoints');
  } catch (err: any) {
    console.warn('[x402] Could not initialize live x402 middleware:', err.message);
  }
}

/**
 * Generate cryptographic simulation or live transaction receipts
 */
export function generateSettlementReceipt(
  agentId: string,
  amount: number,
  network = BASE_SEPOLIA_CHAIN_ID,
  nonce?: string
): {
  txHash: string;
  network: string;
  explorerUrl: string;
  asset: string;
  amount: number;
  timestamp: string;
} {
  const seed = `${agentId}_${amount}_${network}_${nonce || Date.now()}_${Math.random()}`;
  const txHash = keccak256(toHex(seed));

  const explorerBase =
    network === ARB_SEPOLIA_CHAIN_ID
      ? 'https://sepolia.arbiscan.io/tx/'
      : 'https://sepolia.basescan.org/tx/';

  return {
    txHash,
    network,
    explorerUrl: `${explorerBase}${txHash}`,
    asset: TESTNET_USDC_ADDRESS,
    amount,
    timestamp: new Date().toISOString(),
  };
}

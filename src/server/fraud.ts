import { db } from './db.ts';

// In-memory idempotency cache for active authorizations (persists across runs during runtime)
const processedNonces = new Set<string>();
const idempotencyKeys = new Map<string, { settledAt: number; txHash: string; amount: number }>();

export const EXPECTED_USDC_BASE = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'.toLowerCase();
export const SUPPORTED_NETWORKS = ['eip155:84532', 'eip155:421614'];

export interface SecurityCheckResult {
  passed: boolean;
  code?: string;
  reason?: string;
}

export class FraudGuard {
  /**
   * Reject duplicate payment authorizations (Idempotency & Replay Protection)
   */
  static checkAuthorization(authNonce: string, idempotencyKey?: string): SecurityCheckResult {
    if (processedNonces.has(authNonce)) {
      this.logFraud(
        'DUPLICATE_AUTH_REJECTED',
        `Replay attack intercepted: Nonce ${authNonce} was already authorized and settled.`,
        0
      );
      return {
        passed: false,
        code: 'DUPLICATE_AUTH',
        reason: `Duplicate payment authorization detected. Nonce ${authNonce} has already been charged.`,
      };
    }

    if (idempotencyKey && idempotencyKeys.has(idempotencyKey)) {
      const prior = idempotencyKeys.get(idempotencyKey)!;
      return {
        passed: false,
        code: 'IDEMPOTENT_REPLAY',
        reason: `Idempotent request already processed at ${new Date(prior.settledAt).toISOString()} with hash ${prior.txHash}. No double charge applied.`,
      };
    }

    return { passed: true };
  }

  /**
   * Reject unexpected prices (seller demands higher than registered price)
   */
  static checkPriceIntegrity(
    registeredPrice: number,
    requestedPrice: number,
    agentId: string
  ): SecurityCheckResult {
    // 0.0001 tolerance for floating point
    if (requestedPrice > registeredPrice + 0.0001) {
      this.logFraud(
        'PRICE_TAMPER_DETECTED',
        `Seller ${agentId} requested $${requestedPrice.toFixed(4)} USDC exceeding registered quote of $${registeredPrice.toFixed(4)} USDC.`,
        requestedPrice
      );
      return {
        passed: false,
        code: 'PRICE_TAMPER',
        reason: `Price mismatch: Seller demanded $${requestedPrice.toFixed(4)} USDC, which exceeds the registered quote of $${registeredPrice.toFixed(4)} USDC. Payment rejected.`,
      };
    }

    return { passed: true };
  }

  /**
   * Reject incorrect payment addresses
   */
  static checkPaymentAddress(
    registeredPayTo: string | null,
    challengePayTo: string | null,
    agentId: string
  ): SecurityCheckResult {
    if (!registeredPayTo || !challengePayTo) return { passed: true };

    if (registeredPayTo.toLowerCase() !== challengePayTo.toLowerCase()) {
      this.logFraud(
        'ADDRESS_MISMATCH_DETECTED',
        `Seller ${agentId} payment challenge address ${challengePayTo} did not match registered address ${registeredPayTo}.`,
        0
      );
      return {
        passed: false,
        code: 'ADDRESS_MISMATCH',
        reason: `Payment address verification failed. Payout address does not match registered seller identity.`,
      };
    }

    return { passed: true };
  }

  /**
   * Reject incorrect network or token contract
   */
  static checkNetworkAndToken(network: string, asset?: string): SecurityCheckResult {
    if (!SUPPORTED_NETWORKS.includes(network)) {
      return {
        passed: false,
        code: 'UNSUPPORTED_NETWORK',
        reason: `Unsupported network ${network}. Allowed networks: ${SUPPORTED_NETWORKS.join(', ')}`,
      };
    }

    if (asset && asset.toLowerCase() !== EXPECTED_USDC_BASE) {
      return {
        passed: false,
        code: 'INVALID_TOKEN_CONTRACT',
        reason: `Invalid settlement asset. Expected official testnet USDC (${EXPECTED_USDC_BASE}), received ${asset}.`,
      };
    }

    return { passed: true };
  }

  /**
   * Commit settled authorization
   */
  static commitAuthorization(
    authNonce: string,
    txHash: string,
    amount: number,
    idempotencyKey?: string
  ) {
    processedNonces.add(authNonce);
    if (idempotencyKey) {
      idempotencyKeys.set(idempotencyKey, {
        settledAt: Date.now(),
        txHash,
        amount,
      });
    }
  }

  private static logFraud(type: string, details: string, amount: number, network = 'eip155:84532') {
    try {
      db.prepare(`
        INSERT INTO fraud_logs (type, details, blocked_amount, network, detected_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(type, details, amount, network, new Date().toISOString());
    } catch (e) {
      console.error('Failed to log fraud event:', e);
    }
  }

  static getFraudLogs(limit = 20) {
    return db.prepare(`SELECT * FROM fraud_logs ORDER BY id DESC LIMIT ?`).all(limit);
  }
}

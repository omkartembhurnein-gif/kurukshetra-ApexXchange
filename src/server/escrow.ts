import { db } from './db.ts';
import { keccak256, toHex } from 'viem';

export interface EscrowContract {
  id: string;
  runId: number;
  agentId: string;
  amount: number;
  status: 'LOCKED_IN_ESCROW' | 'RELEASED_TO_SELLER' | 'REFUNDED_TO_BUYER';
  txLockHash: string;
  txReleaseHash?: string;
  createdAt: string;
  updatedAt: string;
}

export class EscrowEngine {
  /**
   * Lock funds in escrow prior to agent execution
   */
  static lockFunds(runId: number, agentId: string, amount: number, network = 'eip155:84532'): EscrowContract {
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const txLockHash = keccak256(toHex(`lock_${escrowId}_${runId}_${agentId}_${Date.now()}`));
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO escrow_contracts (id, run_id, agent_id, amount, status, tx_lock_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'LOCKED_IN_ESCROW', ?, ?, ?)
    `).run(escrowId, runId, agentId, amount, txLockHash, now, now);

    return {
      id: escrowId,
      runId,
      agentId,
      amount,
      status: 'LOCKED_IN_ESCROW',
      txLockHash,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Release funds from escrow to seller after successful AI result verification
   */
  static releaseFunds(escrowId: string): { success: boolean; txReleaseHash: string } {
    const txReleaseHash = keccak256(toHex(`release_${escrowId}_${Date.now()}`));
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE escrow_contracts
      SET status = 'RELEASED_TO_SELLER',
          tx_release_hash = ?,
          updated_at = ?
      WHERE id = ?
    `).run(txReleaseHash, now, escrowId);

    return { success: true, txReleaseHash };
  }

  /**
   * Refund buyer if AI result verification fails or seller returns invalid data
   */
  static refundBuyer(escrowId: string, reason: string): { success: boolean; txRefundHash: string } {
    const txRefundHash = keccak256(toHex(`refund_${escrowId}_${Date.now()}`));
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE escrow_contracts
      SET status = 'REFUNDED_TO_BUYER',
          tx_release_hash = ?,
          updated_at = ?
      WHERE id = ?
    `).run(txRefundHash, now, escrowId);

    return { success: true, txRefundHash };
  }

  static getEscrowList(limit = 15) {
    return db.prepare(`SELECT * FROM escrow_contracts ORDER BY updated_at DESC LIMIT ?`).all(limit);
  }
}

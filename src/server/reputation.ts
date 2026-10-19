import { db } from './db.ts';

export interface ReputationUpdateResult {
  newScore: number;
  slaGrade: 'Elite' | 'Trusted' | 'Reliable' | 'Degraded' | 'Suspended';
  slashed: boolean;
  reason?: string;
}

export function computeSlaGrade(score: number): 'Elite' | 'Trusted' | 'Reliable' | 'Degraded' | 'Suspended' {
  if (score >= 95) return 'Elite';
  if (score >= 85) return 'Trusted';
  if (score >= 70) return 'Reliable';
  if (score >= 50) return 'Degraded';
  return 'Suspended';
}

export class ReputationEngine {
  /**
   * Update seller reputation after a service call
   */
  static recordCallResult(
    agentId: string,
    success: boolean,
    latencyMs: number,
    schemaValid: boolean,
    errorMessage?: string
  ): ReputationUpdateResult {
    const agent = db.prepare(`SELECT * FROM agents WHERE id = ?`).get(agentId) as any;
    if (!agent) {
      return { newScore: 50, slaGrade: 'Reliable', slashed: false };
    }

    const currentScore = agent.reputation_score || 95;
    const totalCalls = (agent.total_calls || 0) + 1;
    const failedCalls = (agent.failed_calls || 0) + (success ? 0 : 1);
    const invalidOutputs = (agent.invalid_outputs || 0) + (schemaValid ? 0 : 1);
    const successRate = Math.round(((totalCalls - failedCalls) / totalCalls) * 100);

    // Median latency calculation
    const callTimes = db
      .prepare(`SELECT latency_ms FROM calls WHERE agent_id = ? AND status = 'success' ORDER BY latency_ms`)
      .all(agentId) as { latency_ms: number }[];
    const latencies = callTimes.map((c) => c.latency_ms);
    latencies.push(latencyMs);
    latencies.sort((a, b) => a - b);
    const mid = Math.floor(latencies.length / 2);
    const medianLatency =
      latencies.length % 2 !== 0 ? latencies[mid] : Math.round((latencies[mid - 1] + latencies[mid]) / 2);

    let scoreDelta = 0;
    let reason = '';
    let slashed = false;

    // Automatic penalty logic
    if (!schemaValid) {
      scoreDelta -= 5;
      slashed = true;
      reason = `Automatic Penalty: AI Schema Verification failed (-5). ${errorMessage || 'Invalid JSON schema output'}`;
    } else if (!success) {
      scoreDelta -= 3;
      slashed = true;
      reason = `Automatic Penalty: Service call error or timeout (-3). ${errorMessage || 'HTTP 5xx failure'}`;
    } else {
      // Reward successful, valid call (recovery / maintenance)
      if (currentScore < 100) {
        scoreDelta = 1;
        reason = `Reward: Successful verified call with valid schema (+1)`;
      }
    }

    const newScore = Math.min(100, Math.max(10, currentScore + scoreDelta));
    const slaGrade = computeSlaGrade(newScore);

    // Update agent in DB
    db.prepare(`
      UPDATE agents
      SET reputation_score = ?,
          success_rate = ?,
          median_latency_ms = ?,
          total_calls = ?,
          failed_calls = ?,
          invalid_outputs = ?,
          enabled = ?
      WHERE id = ?
    `).run(
      newScore,
      successRate,
      medianLatency,
      totalCalls,
      failedCalls,
      invalidOutputs,
      newScore >= 40 ? 1 : 0, // Auto-suspend if reputation crashes below 40
      agentId
    );

    // Record audit event if score changed
    if (scoreDelta !== 0) {
      db.prepare(`
        INSERT INTO reputation_events (agent_id, change_amount, new_score, reason, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(agentId, scoreDelta, newScore, reason, new Date().toISOString());
    }

    return {
      newScore,
      slaGrade,
      slashed,
      reason,
    };
  }

  static getReputationHistory(agentId?: string, limit = 25) {
    if (agentId) {
      return db
        .prepare(`SELECT * FROM reputation_events WHERE agent_id = ? ORDER BY id DESC LIMIT ?`)
        .all(agentId, limit);
    }
    return db.prepare(`SELECT * FROM reputation_events ORDER BY id DESC LIMIT ?`).all(limit);
  }

  static getLeaderboard() {
    const agents = db.prepare(`SELECT * FROM agents ORDER BY reputation_score DESC, success_rate DESC`).all() as any[];
    return agents.map((a) => ({
      ...a,
      inputSchema: JSON.parse(a.input_schema || '{}'),
      outputSchema: JSON.parse(a.output_schema || '{}'),
      slaGrade: computeSlaGrade(a.reputation_score),
    }));
  }
}

import type { InputGuardrail } from '@ai-toolkit/core';

/**
 * Rate limiter options
 */
export interface RateLimiterOptions {
  /** Maximum requests per window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Get identifier for rate limiting (e.g., userId, IP) */
  getIdentifier?: (context: any) => string;
}

/**
 * Simple in-memory rate limiter
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private options: RateLimiterOptions) {}

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.options.windowMs
    );

    if (validRequests.length >= this.options.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.options.windowMs
    );
    return Math.max(0, this.options.maxRequests - validRequests.length);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }
}

/**
 * Input guardrail that enforces rate limiting
 */
export function rateLimiter(options: RateLimiterOptions): InputGuardrail {
  const limiter = new RateLimiter(options);
  const { getIdentifier = () => 'default' } = options;

  return {
    name: 'rate-limiter',
    execute: async ({ context }: { input: string; context?: any }) => {
      const identifier = getIdentifier(context);
      const allowed = limiter.isAllowed(identifier);

      if (!allowed) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'Rate limit exceeded',
            identifier,
            remaining: limiter.getRemaining(identifier),
          },
        };
      }

      return { tripwireTriggered: false };
    },
  };
}

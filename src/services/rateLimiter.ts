interface RequestLog {
  timestamp: number;
}

class RateLimiter {
  private requests: RequestLog[] = [];
  private readonly maxRequests: number = 5;
  private readonly timeWindowMs: number = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than the time window
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.timeWindowMs
    );
    
    return this.requests.length < this.maxRequests;
  }

  logRequest(): void {
    this.requests.push({ timestamp: Date.now() });
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0;

    const now = Date.now();
    const oldestRequest = this.requests[0];
    return this.timeWindowMs - (now - oldestRequest.timestamp);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    // Remove requests older than the time window
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.timeWindowMs
    );
    
    return this.maxRequests - this.requests.length;
  }
}

export const rateLimiter = new RateLimiter(); 
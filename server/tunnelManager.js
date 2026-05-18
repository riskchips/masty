const tunnels = new Map();
const pending = new Map();
const requestHistory = new Map();

module.exports = {
  add(id, ws) {
    tunnels.set(id, {
      ws,
      createdAt: Date.now(),
      requests: 0,
      bytes: 0,
      errors: 0,
      slowRequests: 0,
      requestLog: [],
      uptime: 0,
      avgLatency: 0,
      peakBandwidth: 0,
      httpMethods: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 }
    });
  },

  get(id) {
    return tunnels.get(id);
  },

  has(id) {
    return tunnels.has(id);
  },

  remove(id) {
    tunnels.delete(id);
  },

  all() {
    return tunnels;
  },

  increment(id, bytes) {
    const tunnel = tunnels.get(id);
    if (!tunnel) return;

    tunnel.requests++;
    tunnel.bytes += bytes;
  },

  recordRequest(id, request) {
    const tunnel = tunnels.get(id);
    if (!tunnel) return;

    tunnel.requests++;
    if (request.status >= 400) tunnel.errors++;
    if (request.duration > 1000) tunnel.slowRequests++;

    tunnel.httpMethods[request.method] = (tunnel.httpMethods[request.method] || 0) + 1;
    tunnel.requestLog.push({
      timestamp: Date.now(),
      method: request.method,
      path: request.path,
      status: request.status,
      duration: request.duration,
      latency: request.latency,
      ip: request.ip
    });

    // Keep only last 500 requests
    if (tunnel.requestLog.length > 500) {
      tunnel.requestLog.shift();
    }

    tunnel.avgLatency = tunnel.requestLog.reduce((sum, r) => sum + r.latency, 0) / tunnel.requestLog.length;
  },

  getRequestHistory(id, filter = {}) {
    const tunnel = tunnels.get(id);
    if (!tunnel) return [];

    let history = tunnel.requestLog;

    if (filter.method) {
      history = history.filter(r => r.method === filter.method);
    }
    if (filter.status) {
      history = history.filter(r => r.status === filter.status);
    }
    if (filter.minDuration) {
      history = history.filter(r => r.duration >= filter.minDuration);
    }

    return history.slice(-100); // Return last 100
  },

  getAnalytics(id) {
    const tunnel = tunnels.get(id);
    if (!tunnel) return null;

    const uptime = Math.floor((Date.now() - tunnel.createdAt) / 1000);

    return {
      id,
      createdAt: tunnel.createdAt,
      uptime,
      totalRequests: tunnel.requests,
      totalBytes: tunnel.bytes,
      errors: tunnel.errors,
      slowRequests: tunnel.slowRequests,
      errorRate: tunnel.requests > 0 ? ((tunnel.errors / tunnel.requests) * 100).toFixed(2) + '%' : '0%',
      avgLatency: tunnel.avgLatency.toFixed(2) + 'ms',
      requestsByMethod: tunnel.httpMethods
    };
  },

  setPending(id, data) {
    pending.set(id, data);
  },

  getPending(id) {
    return pending.get(id);
  },

  removePending(id) {
    pending.delete(id);
  },

  clearHistory() {
    requestHistory.clear();
  }
};
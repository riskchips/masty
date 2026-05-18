const http = require('http');

const rateLimitStore = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function statusColor(code) {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  if (code >= 300) return '\x1b[36m';
  return '\x1b[32m';
}

function checkRateLimit(ip) {
  const now = Date.now();
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
  }

  const record = rateLimitStore.get(ip);

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  }

  record.count++;

  return record.count <= RATE_LIMIT;
}

function createHTTPServer(tunnelManager) {
  return http.createServer((req, res) => {
    const start = Date.now();

    const parts = req.url.split('/');
    const id = parts[1];

    // Handle analytics endpoint
    if (req.url === '/' && req.method === 'GET') {
      const tunnels = [];
      for (const [tunnelId, tunnel] of tunnelManager.all()) {
        tunnels.push(tunnelManager.getAnalytics(tunnelId));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(tunnels));
    }

    // Handle analytics for specific tunnel
    if (req.url.match(/^\/analytics\//)) {
      const tunnelId = req.url.split('/')[2];
      const analytics = tunnelManager.getAnalytics(tunnelId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(analytics || {}));
    }

    // Handle history endpoint
    if (req.url.match(/^\/history\//)) {
      const tunnelId = req.url.split('/')[2];
      const history = tunnelManager.getRequestHistory(tunnelId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(history));
    }

    if (!id || !tunnelManager.has(id)) {
      res.writeHead(404, { 'X-Tunnel-Error': 'not-found' });
      return res.end('Tunnel not found');
    }

    const tunnel = tunnelManager.get(id);
    const client = tunnel.ws;

    const ip = req.socket.remoteAddress || 'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      res.writeHead(429, { 'X-Rate-Limit': 'exceeded' });
      return res.end('Too many requests');
    }

    if (!client || client.readyState !== 1) {
      res.writeHead(502, { 'X-Tunnel-Error': 'client-disconnected' });
      return res.end('Client not connected');
    }

    const time = new Date().toLocaleTimeString();

    let body = [];

    req.on('data', chunk => body.push(chunk));

    req.on('end', () => {
      const rawBody = Buffer.concat(body);

      const requestId = Math.random().toString(36).slice(2);

      tunnelManager.setPending(requestId, {
        res,
        meta: {
          ip,
          time,
          method: req.method,
          path: req.url,
          start,
          id
        }
      });

      tunnelManager.increment(id, rawBody.length);

      client.send(JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        path: '/' + parts.slice(2).join('/'),
        headers: req.headers,
        body: rawBody.toString('base64'),
        timestamp: Date.now()
      }));

      setTimeout(() => {
        const pending = tunnelManager.getPending(requestId);

        if (!pending) return;

        pending.res.writeHead(504, { 'X-Tunnel-Error': 'timeout' });
        pending.res.end('Tunnel timeout');

        console.log(
          `\x1b[90m[${time}]\x1b[0m \x1b[36m${ip}\x1b[0m ${req.method} ${req.url} ${statusColor(504)}504\x1b[0m`
        );

        tunnelManager.removePending(requestId);
      }, 15000);
    });
module.exports = { createHTTPServer };

module.exports = { createHTTPServer };
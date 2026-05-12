const http = require('http');

function createHTTPServer(tunnelManager) {
  return http.createServer((req, res) => {
    const start = Date.now();

    const parts = req.url.split('/');
    const id = parts[1];

    if (!id || !tunnelManager.has(id)) {
      res.writeHead(404);
      return res.end('Tunnel not found');
    }

    const tunnel = tunnelManager.get(id);
    const client = tunnel.ws;

    if (!client || client.readyState !== 1) {
      res.writeHead(502);
      return res.end('Client not connected');
    }

    const ip =
      req.headers['cf-connecting-ip'] ||
      req.headers['true-client-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

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
          size: rawBody.length
        }
      });

      client.send(JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        path: '/' + parts.slice(2).join('/'),
        headers: req.headers,
        body: rawBody.toString('base64')
      }));

      setTimeout(() => {
        const pending = tunnelManager.getPending(requestId);

        if (!pending) return;

        pending.res.writeHead(504);
        pending.res.end('Tunnel timeout');

        tunnelManager.removePending(requestId);
      }, 15000);
    });
  });
}

module.exports = { createHTTPServer };
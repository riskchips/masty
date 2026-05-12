const http = require('http');

function statusColor(code) {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  if (code >= 300) return '\x1b[36m';
  return '\x1b[32m';
}

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

    const ip = req.socket.remoteAddress || 'unknown';
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
          start
        }
      });

      tunnelManager.increment(id, rawBody.length);

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

        console.log(
          `\x1b[90m[${time}]\x1b[0m \x1b[36m${ip}\x1b[0m ${req.method} ${req.url} ${statusColor(504)}504\x1b[0m`
        );

        tunnelManager.removePending(requestId);
      }, 15000);
    });
  });
}

module.exports = { createHTTPServer };
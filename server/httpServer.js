const http = require('http');

function createHTTPServer(tunnelManager) {
  return http.createServer((req, res) => {
    const parts = req.url.split('/');
    const id = parts[1];

    if (!id || !tunnelManager.has(id)) {
      res.writeHead(404);
      return res.end('Tunnel not found');
    }

    const client = tunnelManager.get(id);

    if (!client || client.readyState !== 1) {
      res.writeHead(502);
      return res.end('Client not connected');
    }

    const ip = req.socket.remoteAddress || 'unknown';
    const time = new Date().toLocaleTimeString();

    process.stdout.write(
      `\x1b[90m[${time}]\x1b[0m \x1b[36m${ip}\x1b[0m ${req.method} ${req.url}\n`
    );

    let body = [];

    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      const requestId = Math.random().toString(36).slice(2);

      tunnelManager.setPending(requestId, res, {
        ip,
        time,
        method: req.method,
        path: req.url
      });

      client.send(JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        path: '/' + parts.slice(2).join('/'),
        headers: req.headers,
        body: Buffer.concat(body).toString('base64')
      }));

      setTimeout(() => {
        const entry = tunnelManager.getPending(requestId);
        if (entry) {
          entry.res.writeHead(504);
          entry.res.end('Tunnel timeout');
          tunnelManager.removePending(requestId);
        }
      }, 10000);
    });
  });
}

module.exports = { createHTTPServer };
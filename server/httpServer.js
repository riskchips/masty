const http = require('http');

function createHTTPServer(tunnelManager) {
  return http.createServer((req, res) => {
    const parts = req.url.split('/');
    const id = parts[1];

    if (!id || !tunnelManager.has(id)) {
      res.writeHead(404);
      return res.end('Tunnel not found');
    }

    let body = [];

    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      const client = tunnelManager.get(id);

      const requestId = Math.random().toString(36).slice(2);

      client.send(JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        path: '/' + parts.slice(2).join('/'),
        headers: req.headers,
        body: Buffer.concat(body).toString('base64')
      }));

      tunnelManager.setPending(requestId, res);
    });
  });
}

module.exports = { createHTTPServer };
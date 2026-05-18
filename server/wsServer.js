const WebSocket = require('ws');
const generateId = require('./utils/generateId');

function statusColor(code) {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  if (code >= 300) return '\x1b[36m';
  return '\x1b[32m';
}

function createWSServer(server, tunnelManager) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    const id = generateId();

    tunnelManager.add(id, ws);

    ws.send(JSON.stringify({
      type: 'init',
      id
    }));

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);

      if (data.type === 'pong') {
        ws.latency = Date.now() - data.timestamp;
        return;
      }

      if (data.type === 'response') {
        const entry = tunnelManager.getPending(data.requestId);

        if (!entry) return;

        const { res, meta } = entry;

        const duration = Date.now() - meta.start;

        const body = Buffer.from(data.body, 'base64');

        res.writeHead(data.status, data.headers);
        res.end(body);

        // Record analytics
        tunnelManager.recordRequest(meta.id, {
          method: meta.method,
          path: meta.path,
          status: data.status,
          duration,
          latency: ws.latency || 0,
          ip: meta.ip
        });

        ws.send(JSON.stringify({
          type: 'log',
          ip: meta.ip,
          method: meta.method,
          path: meta.path,
          status: data.status,
          duration,
          time: meta.time,
          latency: ws.latency || 0
        }));

        tunnelManager.removePending(data.requestId);
      }
    });

    ws.on('close', () => {
      tunnelManager.remove(id);
    });

    ws.on('error', () => {});
  });

  setInterval(() => {
    for (const tunnel of tunnelManager.all().values()) {
      if (tunnel.ws.readyState === 1) {
        tunnel.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }
  }, 5000);
}

module.exports = { createWSServer };
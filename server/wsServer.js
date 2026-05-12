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

    console.log(`\nTunnel connected: ${id}`);
    console.log(`Active tunnels: ${tunnelManager.all().size}\n`);

    ws.send(JSON.stringify({
      type: 'init',
      id
    }));

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);

      if (data.type === 'pong') return;

      if (data.type === 'response') {
        const entry = tunnelManager.getPending(data.requestId);

        if (!entry) return;

        const { res, meta } = entry;

        const duration = Date.now() - meta.start;

        const body = Buffer.from(data.body, 'base64');

        res.writeHead(data.status, data.headers);
        res.end(body);

        console.log(
          `\x1b[90m[${meta.time}]\x1b[0m \x1b[36m${meta.ip}\x1b[0m ${meta.method} ${meta.path} ${statusColor(data.status)}${data.status}\x1b[0m ${duration}ms`
        );

        tunnelManager.removePending(data.requestId);
      }
    });

    ws.on('close', () => {
      tunnelManager.remove(id);

      console.log(`Tunnel disconnected: ${id}`);
      console.log(`Active tunnels: ${tunnelManager.all().size}`);
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
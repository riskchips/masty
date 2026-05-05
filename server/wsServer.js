const WebSocket = require('ws');
const generateId = require('./utils/generateId');

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

      if (data.type === 'response') {
        const entry = tunnelManager.getPending(data.requestId);
        if (!entry) return;

        const { res, meta } = entry;
        const body = Buffer.from(data.body, 'base64');

        res.writeHead(data.status, data.headers);
        res.end(body);

        process.stdout.write(
          `\x1b[90m[${meta.time}]\x1b[0m \x1b[36m${meta.ip}\x1b[0m ${meta.method} ${meta.path} → ${data.status}\n`
        );

        tunnelManager.removePending(data.requestId);
      }
    });

    ws.on('close', () => {
      tunnelManager.remove(id);
    });
  });
}

module.exports = { createWSServer };
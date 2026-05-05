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
        const res = tunnelManager.getPending(data.requestId);

        if (!res) return;

        const body = Buffer.from(data.body, 'base64');

        res.writeHead(data.status, data.headers);
        res.end(body);

        tunnelManager.removePending(data.requestId);
      }
    });

    ws.on('close', () => {
      tunnelManager.remove(id);
    });
  });
}

module.exports = { createWSServer };
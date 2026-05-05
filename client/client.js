const WebSocket = require('ws');
const forwardRequest = require('./forwarder');
const logger = require('./utils/logger');

function startClient(port) {
  const ws = new WebSocket('wss://masty.onrender.com');

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'init') {
      logger(`Public URL: https://masty.onrender.com/${data.id}`);
    }

    if (data.type === 'request') {
      const response = await forwardRequest(port, data);

      ws.send(JSON.stringify({
        type: 'response',
        requestId: data.requestId,
        status: response.status,
        headers: response.headers,
        body: response.body
      }));
    }
  });
}

module.exports = startClient;
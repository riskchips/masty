const WebSocket = require('ws');
const forwardRequest = require('./forwarder');

function startClient(port) {
  const ws = new WebSocket('wss://masty.onrender.com');

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'init') {
      console.log(`\x1b[36mURL:\x1b[0m https://masty.onrender.com/${data.id}`);
      console.log(`Forwarding → localhost:${port}\n`);
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
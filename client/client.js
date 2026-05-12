const WebSocket = require('ws');
const forwardRequest = require('./forwarder');

function connect(port) {
  const ws = new WebSocket('wss://masty.onrender.com');

  let latency = 0;

  ws.on('open', () => {
    console.log('\x1b[32mConnected to server\x1b[0m\n');
  });

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'init') {
      console.log(`URL        https://masty.onrender.com/${data.id}`);
      console.log(`Forward    localhost:${port}`);
      console.log(`Latency    ${latency}ms\n`);
    }

    if (data.type === 'ping') {
      latency = Date.now() - data.timestamp;

      ws.send(JSON.stringify({
        type: 'pong'
      }));

      return;
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

  ws.on('close', () => {
    console.log('\nDisconnected. Reconnecting...\n');

    setTimeout(() => {
      connect(port);
    }, 3000);
  });

  ws.on('error', () => {});
}

module.exports = connect;
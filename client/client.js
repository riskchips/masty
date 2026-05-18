const WebSocket = require('ws');
const forwardRequest = require('./forwarder');

function colorStatus(code) {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  if (code >= 300) return '\x1b[36m';
  return '\x1b[32m';
}

function connect(port, options = {}) {
  const ws = new WebSocket('wss://masty.onrender.com');

  let currentLatency = 0;
  let requestCount = 0;
  let tunnelId = null;

  ws.on('open', () => {
    console.clear();

    console.log('\x1b[1mMASTY TUNNEL v2\x1b[0m\n');
    console.log('\x1b[32m✓ Connected to server\x1b[0m\n');
  });

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'init') {
      tunnelId = data.id;
      console.log(`\x1b[36m🔗 Tunnel URL\x1b[0m     https://masty.onrender.com/${data.id}`);
      console.log(`\x1b[36m📍 Forward To\x1b[0m     localhost:${port}`);
      console.log(`\x1b[36m⚡ Latency\x1b[0m        calculating...\n`);
      console.log(`\x1b[90mAnalytics: https://masty.onrender.com/analytics/${data.id}`);
      console.log(`History:   https://masty.onrender.com/history/${data.id}\x1b[0m\n`);
      console.log(`\x1b[1mLive Requests:\x1b[0m\n`);
    }

    if (data.type === 'ping') {
      currentLatency = Date.now() - data.timestamp;

      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: data.timestamp
      }));

      return;
    }

    if (data.type === 'log') {
      requestCount++;
      process.stdout.write(
        `\x1b[90m[${data.time}]\x1b[0m ` +
        `\x1b[36m${data.ip}\x1b[0m ` +
        `${data.method} ${data.path} ` +
        `${colorStatus(data.status)}${data.status}\x1b[0m ` +
        `\x1b[90m${data.duration}ms\x1b[0m ` +
        `\x1b[35m${data.latency}ms\x1b[0m ` +
        `\x1b[33m(#${requestCount})\x1b[0m\n`
      );

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
const WebSocket = require('ws');
const forwardRequest = require('./forwarder');

function methodColor(method) {
  if (method === 'GET') return '\x1b[32m';
  if (method === 'POST') return '\x1b[34m';
  if (method === 'DELETE') return '\x1b[31m';
  return '\x1b[35m';
}

function statusColor(code) {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  if (code >= 300) return '\x1b[36m';
  return '\x1b[32m';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / 1024 / 1024).toFixed(1) + 'MB';
}

function formatUptime(ms) {
  const total = Math.floor(ms / 1000);

  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');

  return `${h}:${m}:${s}`;
}

function connect(port) {
  const ws = new WebSocket('wss://masty.onrender.com');

  let latency = 0;
  let requests = 0;
  let traffic = 0;

  const started = Date.now();

  function renderHeader(url) {
    console.clear();

    console.log('\x1b[1mMASTY TUNNEL\x1b[0m\n');

    console.log(`URL        ${url}`);
    console.log(`Forward    localhost:${port}`);
    console.log(`Status     Connected`);
    console.log(`Latency    ${latency}ms`);
    console.log(`Requests   ${requests}`);
    console.log(`Traffic    ${formatBytes(traffic)}`);
    console.log(`Uptime     ${formatUptime(Date.now() - started)}`);

    console.log('\n────────────────────────────────────────\n');
  }

  let tunnelUrl = '';

  ws.on('open', () => {
    renderHeader('');
  });

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'init') {
      tunnelUrl = `https://masty.onrender.com/${data.id}`;
      renderHeader(tunnelUrl);
    }

    if (data.type === 'ping') {
      const sent = data.timestamp;

      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: sent
      }));

      latency = Date.now() - sent;

      renderHeader(tunnelUrl);

      return;
    }

    if (data.type === 'log') {
      requests++;

      traffic += data.duration || 0;

      process.stdout.write(
        `\x1b[90m[${data.time}]\x1b[0m ` +
        `\x1b[36m${data.ip}\x1b[0m ` +
        `${methodColor(data.method)}${data.method.padEnd(6)}\x1b[0m ` +
        `${data.path.padEnd(25)} ` +
        `${statusColor(data.status)}${data.status}\x1b[0m ` +
        `\x1b[90m${data.duration}ms\x1b[0m\n`
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
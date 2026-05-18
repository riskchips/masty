#!/usr/bin/env node

const startClient = require('./client');

console.clear();

const args = process.argv.slice(2);
const command = args[0];
const options = {};

// Parse arguments
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = value;
      i++;
    }
  }
}

if (!command) {
  console.log('\x1b[1mMASTY TUNNEL v2\x1b[0m\n');
  console.log('Usage: masty <command> [options]\n');
  console.log('Commands:');
  console.log('  run <port>              Start tunnel on specified port (default: 3000)');
  console.log('  help                    Show this help message\n');
  console.log('Options:');
  console.log('  --host <hostname>       Specify custom server (default: masty.onrender.com)');
  console.log('  --verbose               Enable verbose logging');
  console.log('  --auto-restart          Auto-restart on disconnect (enabled by default)\n');
  process.exit(0);
}

if (command === 'help' || command === '--help' || command === '-h') {
  console.log('\x1b[1mMASTY TUNNEL v2\x1b[0m\n');
  console.log('A lightweight local tunneling CLI for exposing localhost to the internet.\n');
  console.log('Usage: masty <command> [options]\n');
  console.log('Commands:');
  console.log('  run <port>              Start tunnel on specified port (default: 3000)');
  console.log('  help                    Show this help message\n');
  console.log('Examples:');
  console.log('  masty run 3000');
  console.log('  masty run 8080 --verbose');
  console.log('  npx masty-tunnel run 5000\n');
  console.log('Features:');
  console.log('  ✓ Rate limiting (100 req/min per IP)');
  console.log('  ✓ Real-time analytics dashboard');
  console.log('  ✓ Request history & inspection');
  console.log('  ✓ Automatic reconnection');
  console.log('  ✓ Latency monitoring');
  console.log('  ✓ Error tracking\n');
  process.exit(0);
}

if (command === 'run') {
  const port = parseInt(args[1]) || 3000;

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('\x1b[31m✗ Invalid port number\x1b[0m');
    process.exit(1);
  }

  console.log('\x1b[1mMASTY TUNNEL v2\x1b[0m\n');
  console.log('\x1b[33mℹ Starting tunnel...\x1b[0m\n');

  startClient(port, options);

  process.on('SIGINT', () => {
    console.log('\n\x1b[33mℹ Tunnel stopped\x1b[0m\n');
    process.exit(0);
  });

  process.on('SIGHUP', () => {
    if (options['auto-restart'] !== false) {
      console.log('\n\x1b[33mℹ Reconnecting...\x1b[0m\n');
      startClient(port, options);
    }
  });
} else {
  console.log('\x1b[31m✗ Unknown command: ' + command + '\x1b[0m');
  console.log('Run "masty help" for usage information\n');
  process.exit(1);
}
#!/usr/bin/env node

const startClient = require('./client');

console.clear();

const args = process.argv.slice(2);

if (args[0] === 'run') {
  const port = args[1] || 3000;

  console.log('\x1b[1mMASTY TUNNEL\x1b[0m\n');

  startClient(port);

  process.on('SIGINT', () => {
    console.log('\nTunnel stopped\n');
    process.exit();
  });
}
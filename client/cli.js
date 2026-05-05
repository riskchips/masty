#!/usr/bin/env node

const startClient = require('./client');

const args = process.argv.slice(2);

if (args[0] === 'run') {
  const port = args[1] || 3000;
  startClient(port);
}
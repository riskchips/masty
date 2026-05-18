#!/usr/bin/env node

const assert = require('assert');
const tunnelManager = require('../server/tunnelManager');

console.log('\x1b[1m🧪 MASTY TUNNEL v2 - TEST SUITE\x1b[0m\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`\x1b[32m✓\x1b[0m ${name}`);
    passedTests++;
  } catch (err) {
    console.log(`\x1b[31m✗\x1b[0m ${name}`);
    console.log(`  ${err.message}\n`);
    failedTests++;
  }
}

// Test 1: Tunnel Manager - Add tunnel
test('Tunnel Manager: Add tunnel', () => {
  const mockWs = { readyState: 1 };
  tunnelManager.add('test-id-1', mockWs);
  
  assert.strictEqual(tunnelManager.has('test-id-1'), true, 'Tunnel should exist');
  const tunnel = tunnelManager.get('test-id-1');
  assert.strictEqual(tunnel.requests, 0, 'Initial requests should be 0');
  assert.strictEqual(tunnel.bytes, 0, 'Initial bytes should be 0');
  assert.strictEqual(tunnel.errors, 0, 'Initial errors should be 0');
});

// Test 2: Tunnel Manager - Increment stats
test('Tunnel Manager: Increment stats', () => {
  tunnelManager.add('test-id-2', {});
  tunnelManager.increment('test-id-2', 1024);
  
  const tunnel = tunnelManager.get('test-id-2');
  assert.strictEqual(tunnel.requests, 1, 'Request count should be 1');
  assert.strictEqual(tunnel.bytes, 1024, 'Bytes should be 1024');
});

// Test 3: Tunnel Manager - Record request
test('Tunnel Manager: Record request', () => {
  tunnelManager.add('test-id-3', {});
  
  tunnelManager.recordRequest('test-id-3', {
    method: 'GET',
    path: '/api/test',
    status: 200,
    duration: 45,
    latency: 12,
    ip: '192.168.1.1'
  });
  
  const tunnel = tunnelManager.get('test-id-3');
  assert.strictEqual(tunnel.requestLog.length, 1, 'Should have 1 request in log');
  assert.strictEqual(tunnel.httpMethods.GET, 1, 'GET count should be 1');
  assert.strictEqual(tunnel.errors, 0, 'Error count should be 0');
});

// Test 4: Tunnel Manager - Record error request
test('Tunnel Manager: Record error request', () => {
  tunnelManager.add('test-id-4', {});
  
  tunnelManager.recordRequest('test-id-4', {
    method: 'POST',
    path: '/api/fail',
    status: 500,
    duration: 100,
    latency: 15,
    ip: '192.168.1.2'
  });
  
  const tunnel = tunnelManager.get('test-id-4');
  assert.strictEqual(tunnel.errors, 1, 'Error count should be 1');
});

// Test 5: Tunnel Manager - Record slow request
test('Tunnel Manager: Record slow request', () => {
  tunnelManager.add('test-id-5', {});
  
  tunnelManager.recordRequest('test-id-5', {
    method: 'GET',
    path: '/slow',
    status: 200,
    duration: 2000,
    latency: 50,
    ip: '192.168.1.3'
  });
  
  const tunnel = tunnelManager.get('test-id-5');
  assert.strictEqual(tunnel.slowRequests, 1, 'Slow request count should be 1');
});

// Test 6: Tunnel Manager - Get analytics
test('Tunnel Manager: Get analytics', () => {
  tunnelManager.add('test-id-6', {});
  
  tunnelManager.recordRequest('test-id-6', {
    method: 'GET',
    path: '/test',
    status: 200,
    duration: 100,
    latency: 20,
    ip: '192.168.1.4'
  });
  
  const analytics = tunnelManager.getAnalytics('test-id-6');
  assert.strictEqual(analytics.totalRequests, 1, 'Total requests should be 1');
  assert.strictEqual(analytics.errors, 0, 'Errors should be 0');
  assert.strictEqual(typeof analytics.avgLatency, 'string', 'avgLatency should be a string');
});

// Test 7: Tunnel Manager - Get request history
test('Tunnel Manager: Get request history', () => {
  tunnelManager.add('test-id-7', {});
  
  tunnelManager.recordRequest('test-id-7', {
    method: 'POST',
    path: '/api',
    status: 201,
    duration: 80,
    latency: 25,
    ip: '192.168.1.5'
  });
  
  tunnelManager.recordRequest('test-id-7', {
    method: 'GET',
    path: '/api',
    status: 200,
    duration: 50,
    latency: 15,
    ip: '192.168.1.6'
  });
  
  const history = tunnelManager.getRequestHistory('test-id-7');
  assert.strictEqual(history.length, 2, 'History should have 2 requests');
});

// Test 8: Tunnel Manager - Filter history by method
test('Tunnel Manager: Filter history by method', () => {
  tunnelManager.add('test-id-8', {});
  
  tunnelManager.recordRequest('test-id-8', { method: 'GET', path: '/a', status: 200, duration: 50, latency: 10, ip: '192.168.1.7' });
  tunnelManager.recordRequest('test-id-8', { method: 'POST', path: '/b', status: 201, duration: 60, latency: 12, ip: '192.168.1.8' });
  tunnelManager.recordRequest('test-id-8', { method: 'GET', path: '/c', status: 200, duration: 45, latency: 11, ip: '192.168.1.9' });
  
  const history = tunnelManager.getRequestHistory('test-id-8', { method: 'GET' });
  assert.strictEqual(history.length, 2, 'Filtered history should have 2 GET requests');
});

// Test 9: Tunnel Manager - Filter history by status
test('Tunnel Manager: Filter history by status', () => {
  tunnelManager.add('test-id-9', {});
  
  tunnelManager.recordRequest('test-id-9', { method: 'GET', path: '/a', status: 200, duration: 50, latency: 10, ip: '192.168.1.10' });
  tunnelManager.recordRequest('test-id-9', { method: 'GET', path: '/b', status: 500, duration: 100, latency: 20, ip: '192.168.1.11' });
  
  const history = tunnelManager.getRequestHistory('test-id-9', { status: 500 });
  assert.strictEqual(history.length, 1, 'Filtered history should have 1 error');
});

// Test 10: Tunnel Manager - Remove tunnel
test('Tunnel Manager: Remove tunnel', () => {
  tunnelManager.add('test-id-10', {});
  assert.strictEqual(tunnelManager.has('test-id-10'), true, 'Tunnel should exist before removal');
  
  tunnelManager.remove('test-id-10');
  assert.strictEqual(tunnelManager.has('test-id-10'), false, 'Tunnel should not exist after removal');
});

// Test 11: Tunnel Manager - Pending requests
test('Tunnel Manager: Pending requests', () => {
  const data = { res: {}, meta: { ip: '192.168.1.12' } };
  
  tunnelManager.setPending('req-1', data);
  assert.strictEqual(tunnelManager.getPending('req-1') !== undefined, true, 'Pending request should exist');
  
  tunnelManager.removePending('req-1');
  assert.strictEqual(tunnelManager.getPending('req-1'), undefined, 'Pending request should be removed');
});

// Test 12: Multiple HTTP methods tracking
test('Tunnel Manager: Multiple HTTP methods tracking', () => {
  tunnelManager.add('test-id-12', {});
  
  tunnelManager.recordRequest('test-id-12', { method: 'GET', path: '/a', status: 200, duration: 50, latency: 10, ip: '192.168.1.13' });
  tunnelManager.recordRequest('test-id-12', { method: 'POST', path: '/b', status: 201, duration: 60, latency: 12, ip: '192.168.1.14' });
  tunnelManager.recordRequest('test-id-12', { method: 'PUT', path: '/c', status: 200, duration: 70, latency: 14, ip: '192.168.1.15' });
  tunnelManager.recordRequest('test-id-12', { method: 'DELETE', path: '/d', status: 204, duration: 40, latency: 8, ip: '192.168.1.16' });
  
  const tunnel = tunnelManager.get('test-id-12');
  assert.strictEqual(tunnel.httpMethods.GET, 1, 'GET count should be 1');
  assert.strictEqual(tunnel.httpMethods.POST, 1, 'POST count should be 1');
  assert.strictEqual(tunnel.httpMethods.PUT, 1, 'PUT count should be 1');
  assert.strictEqual(tunnel.httpMethods.DELETE, 1, 'DELETE count should be 1');
});

// Test 13: Average latency calculation
test('Tunnel Manager: Average latency calculation', () => {
  tunnelManager.add('test-id-13', {});
  
  tunnelManager.recordRequest('test-id-13', { method: 'GET', path: '/a', status: 200, duration: 50, latency: 10, ip: '192.168.1.17' });
  tunnelManager.recordRequest('test-id-13', { method: 'GET', path: '/b', status: 200, duration: 60, latency: 20, ip: '192.168.1.18' });
  tunnelManager.recordRequest('test-id-13', { method: 'GET', path: '/c', status: 200, duration: 70, latency: 30, ip: '192.168.1.19' });
  
  const analytics = tunnelManager.getAnalytics('test-id-13');
  assert.strictEqual(analytics.avgLatency, '20.00ms', 'Average latency should be 20ms');
});

// Test 14: Error rate calculation
test('Tunnel Manager: Error rate calculation', () => {
  tunnelManager.add('test-id-14', {});
  
  tunnelManager.recordRequest('test-id-14', { method: 'GET', path: '/a', status: 200, duration: 50, latency: 10, ip: '192.168.1.20' });
  tunnelManager.recordRequest('test-id-14', { method: 'GET', path: '/b', status: 500, duration: 100, latency: 20, ip: '192.168.1.21' });
  tunnelManager.recordRequest('test-id-14', { method: 'GET', path: '/c', status: 404, duration: 60, latency: 15, ip: '192.168.1.22' });
  
  const analytics = tunnelManager.getAnalytics('test-id-14');
  assert.strictEqual(analytics.errorRate, '66.67%', 'Error rate should be 66.67%');
});

// Test 15: All tunnels retrieval
test('Tunnel Manager: Get all tunnels', () => {
  tunnelManager.clearHistory();
  tunnelManager.add('tunnel-1', {});
  tunnelManager.add('tunnel-2', {});
  tunnelManager.add('tunnel-3', {});
  
  const all = tunnelManager.all();
  assert.strictEqual(all.size >= 3, true, 'Should have at least 3 tunnels');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n\x1b[1mTest Results:\x1b[0m`);
console.log(`  \x1b[32m✓ Passed: ${passedTests}\x1b[0m`);
console.log(`  \x1b[31m✗ Failed: ${failedTests}\x1b[0m`);
console.log(`  Total: ${passedTests + failedTests}\n`);

if (failedTests === 0) {
  console.log('\x1b[32m🎉 All tests passed!\x1b[0m\n');
  process.exit(0);
} else {
  console.log(`\x1b[31m❌ ${failedTests} test(s) failed\x1b[0m\n`);
  process.exit(1);
}

const tunnels = new Map();
const pending = new Map();

module.exports = {
  add(id, ws) {
    tunnels.set(id, {
      ws,
      createdAt: Date.now(),
      requests: 0,
      bytes: 0
    });
  },

  get(id) {
    return tunnels.get(id);
  },

  has(id) {
    return tunnels.has(id);
  },

  remove(id) {
    tunnels.delete(id);
  },

  all() {
    return tunnels;
  },

  increment(id, bytes) {
    const tunnel = tunnels.get(id);
    if (!tunnel) return;

    tunnel.requests++;
    tunnel.bytes += bytes;
  },

  setPending(id, data) {
    pending.set(id, data);
  },

  getPending(id) {
    return pending.get(id);
  },

  removePending(id) {
    pending.delete(id);
  }
};
const tunnels = new Map();
const pending = new Map();

module.exports = {
  add(id, ws) {
    tunnels.set(id, ws);
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
  setPending(id, res, meta) {
    res.on('close', () => {
      pending.delete(id);
    });

    pending.set(id, { res, meta });
  },
  getPending(id) {
    return pending.get(id);
  },
  removePending(id) {
    pending.delete(id);
  }
};
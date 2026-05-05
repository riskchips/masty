const { createHTTPServer } = require('./httpServer');
const { createWSServer } = require('./wsServer');
const tunnelManager = require('./tunnelManager');

const PORT = process.env.PORT || 3000;

const server = createHTTPServer(tunnelManager);
createWSServer(server, tunnelManager);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port', PORT);
});
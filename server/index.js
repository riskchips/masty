const { createHTTPServer } = require('./httpServer');
const { createWSServer } = require('./wsServer');
const tunnelManager = require('./tunnelManager');

const PORT = 3000;

const httpServer = createHTTPServer(tunnelManager);
createWSServer(httpServer, tunnelManager);

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
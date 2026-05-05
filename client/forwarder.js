const http = require('http');

function forwardRequest(port, data) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: data.path,
      method: data.method,
      headers: data.headers
    }, (res) => {
      let chunks = [];

      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('base64')
        });
      });
    });

    if (data.body) {
      req.write(Buffer.from(data.body, 'base64'));
    }

    req.end();
  });
}

module.exports = forwardRequest;
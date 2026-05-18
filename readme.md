# Masty Tunnel v2

**Advanced local tunneling CLI for exposing localhost to the internet with analytics, rate limiting, and request inspection.**

A lightweight, powerful tool that exposes your local server to the public internet using a temporary public URL. Perfect for testing APIs, webhooks, webhooks integrations, and development servers without deploying them.

---

## 🚀 Features

- ✅ **Expose localhost to public URL** - Share your local server instantly
- ✅ **Real-time Analytics Dashboard** - Monitor tunnel stats and performance
- ✅ **Request History & Inspection** - View and filter past requests
- ✅ **Rate Limiting** - 100 requests per minute per IP (configurable)
- ✅ **Error Tracking** - Track 4xx and 5xx errors automatically
- ✅ **Performance Monitoring** - Measure latency and response times
- ✅ **HTTP Method Tracking** - See GET, POST, PUT, DELETE, PATCH stats
- ✅ **Slow Request Detection** - Identify requests over 1 second
- ✅ **Live Request Logging** - Color-coded real-time logs
- ✅ **Automatic Reconnection** - Auto-reconnect on disconnect
- ✅ **WebSocket Support** - Efficient bidirectional communication
- ✅ **Multiple HTTP Methods** - All standard HTTP methods supported
- ✅ **Custom Headers Support** - Forward custom headers to your server
- ✅ **Base64 Encoding** - Secure binary data handling
- ✅ **CLI & Programmatic API** - Use as CLI or import as module

---

## 📦 Installation

### Global Installation
```bash
npm install -g masty-tunnel
```

### Using npx (no install required)
```bash
npx masty-tunnel run 3000
```

### Local Installation
```bash
npm install masty-tunnel
```

---

## 🎯 Quick Start

### 1. Start Your Local Server
```bash
# Example with Node.js
node app.js
# Your server should be running on a port like 3000, 8080, etc.
```

### 2. Start Masty Tunnel
```bash
masty run 3000
```

You'll see:
```
MASTY TUNNEL v2

✓ Connected to server

🔗 Tunnel URL     https://masty.onrender.com/abc123xyz
📍 Forward To     localhost:3000
⚡ Latency        calculating...

Analytics: https://masty.onrender.com/analytics/abc123xyz
History:   https://masty.onrender.com/history/abc123xyz

Live Requests:

[12:30:45] 192.168.1.100 GET /api/users 200 45ms 12ms (#1)
[12:30:46] 192.168.1.101 POST /api/data 201 120ms 15ms (#2)
```

### 3. Share Your URL
Share `https://masty.onrender.com/abc123xyz` with anyone to test webhooks, APIs, or integrations!

---

## 📊 Analytics API

### View All Active Tunnels
```bash
curl https://masty.onrender.com/
```

### Get Tunnel Analytics
```bash
curl https://masty.onrender.com/analytics/{tunnel-id}
```

Response:
```json
{
  "id": "abc123xyz",
  "createdAt": 1621234567890,
  "uptime": 3600,
  "totalRequests": 42,
  "totalBytes": 102400,
  "errors": 2,
  "slowRequests": 1,
  "errorRate": "4.76%",
  "avgLatency": "18.50ms",
  "requestsByMethod": {
    "GET": 30,
    "POST": 10,
    "PUT": 2,
    "DELETE": 0,
    "PATCH": 0,
    "HEAD": 0,
    "OPTIONS": 0
  }
}
```

### Get Request History
```bash
curl https://masty.onrender.com/history/{tunnel-id}
```

Response:
```json
[
  {
    "timestamp": 1621234567890,
    "method": "GET",
    "path": "/api/users",
    "status": 200,
    "duration": 45,
    "latency": 12,
    "ip": "192.168.1.100"
  },
  ...
]
```

### Filter Request History
```bash
# By method
curl "https://masty.onrender.com/history/{tunnel-id}?method=POST"

# By status
curl "https://masty.onrender.com/history/{tunnel-id}?status=500"

# By minimum duration
curl "https://masty.onrender.com/history/{tunnel-id}?minDuration=1000"
```

---

## 💻 CLI Usage

### Basic Command
```bash
masty run <port>
```

### Examples
```bash
# Run on default port 3000
masty run

# Run on custom port
masty run 8080

# Run on port 5000 with verbose logging
masty run 5000 --verbose

# Run with custom server
masty run 3000 --host custom-server.com

# Enable auto-restart
masty run 3000 --auto-restart
```

### CLI Help
```bash
masty help
masty --help
masty -h
```

---

## 🔌 Advanced Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host` | Custom server hostname | masty.onrender.com |
| `--verbose` | Enable verbose logging | false |
| `--auto-restart` | Auto-reconnect on disconnect | true |

---

## 📋 Use Cases

1. **Webhook Testing**
   - Receive webhooks from Stripe, GitHub, Twilio, etc.
   - Test webhook handlers locally
   - Debug webhook integrations

2. **API Development**
   - Share your dev API with teammates
   - Test third-party integrations
   - Demo your API without deployment

3. **Mobile Testing**
   - Test your local backend from mobile devices
   - Test on real devices/networks
   - Debug mobile app integrations

4. **IoT & Hardware**
   - Receive data from IoT devices
   - Test device integrations
   - Monitor real-time device data

5. **Rapid Prototyping**
   - Share prototypes instantly
   - Collaborate with non-technical users
   - Test on production-like environments

---

## 🛠️ Technical Details

### Architecture
- **Protocol**: WebSocket + HTTP
- **Server**: Node.js HTTP server
- **Encoding**: Base64 for request/response bodies
- **Timeouts**: 15 seconds per request
- **Rate Limiting**: 100 requests/minute per IP

### Performance Metrics
- Request latency tracking
- Response duration measurement
- Bandwidth monitoring
- Error rate calculation
- Slow request detection (>1s)

### Data Stored
- Last 500 requests per tunnel
- HTTP method breakdown
- Error tracking
- Average latency calculation
- Uptime since tunnel creation

---

## 📊 Monitoring

### Real-time Metrics
The CLI displays:
- `Status Code` - HTTP response code (color-coded)
- `Duration` - Server response time
- `Latency` - Network latency between tunnel client and server
- `Request Count` - Running request number
- `IP Address` - Client IP

### Color Coding
- 🟢 **2xx Success** - Green
- 🔵 **3xx Redirect** - Cyan
- 🟡 **4xx Client Error** - Yellow
- 🔴 **5xx Server Error** - Red

---

## 🔒 Security Considerations

1. **Rate Limiting** - Built-in rate limiting prevents abuse
2. **Request Timeout** - Requests timeout after 15 seconds
3. **Public URLs** - Tunnels are public, don't expose sensitive data
4. **HTTPS Support** - All connections use wss:// (WebSocket Secure)
5. **IP Tracking** - All requests are logged with source IP

---

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test
```

This runs 15+ unit tests covering:
- Tunnel creation and management
- Request recording and analytics
- Error tracking
- Latency calculation
- HTTP method tracking
- Request filtering
- Analytics generation

---

## 📝 Examples

### Example 1: Express Server
```javascript
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from local!' });
});

app.listen(3000, () => console.log('Server running on :3000'));
```

```bash
# Terminal 1: Start your server
node app.js

# Terminal 2: Start masty tunnel
masty run 3000
# Get: https://masty.onrender.com/abc123xyz

# Terminal 3: Test it
curl https://masty.onrender.com/abc123xyz/api/hello
# Response: {"message":"Hello from local!"}
```

### Example 2: Webhook Testing
```bash
# Start your webhook handler on port 8080
masty run 8080

# Get URL: https://masty.onrender.com/xyz789abc
# Set this as your webhook URL in Stripe Dashboard
# Receive and debug webhook events in real-time!
```

### Example 3: Mobile Testing
```bash
# Start your API server
masty run 5000

# Get URL: https://masty.onrender.com/dev123xyz
# Configure your mobile app to hit: https://masty.onrender.com/dev123xyz
# Test your API on real mobile devices!
```

---

## 🐛 Troubleshooting

### Can't connect to tunnel server
```bash
# Check your internet connection
# Make sure port is not already in use
masty run 3000
```

### Tunnel keeps disconnecting
```bash
# Enable auto-restart (enabled by default)
masty run 3000 --auto-restart

# Check server logs for errors
masty run 3000 --verbose
```

### High latency
- Check your internet connection
- Verify your server is responsive
- Check CPU/memory usage

### Rate limit exceeded
- Wait 60 seconds before retrying
- Current limit: 100 requests/minute per IP
- Contact for custom limits if needed

---

## 📦 Dependencies

- **ws** (^8.20.0) - WebSocket server implementation
- **crypto** (^1.0.1) - Node.js crypto module

No external service dependencies!

---

## 📄 License

MIT License - Feel free to use in any project

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📮 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/riskchips/masty/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/riskchips/masty/discussions)
- 📧 **Linkedin**: [LinkedIn](https://www.linkedin.com/in/arnabdasdev)

---

## 🎉 Special Thanks

- Built with Node.js
- Powered by WebSockets
- Inspired by ngrok and similar tunneling tools

---

## 📊 Version History

### v2.0.1 (Latest)
- ✨ Advanced analytics dashboard
- ✨ Request history & filtering
- ✨ Rate limiting (100 req/min)
- ✨ Error tracking & reporting
- ✨ HTTP method statistics
- ✨ Slow request detection
- ✨ Enhanced CLI with help
- ✨ Comprehensive test suite
- 🐛 Bug fixes and improvements

### v1.1.4
- Initial stable release
- Basic tunneling
- Real-time logging

---

**Made with ❤️ by Masty**

Start tunneling now: `npm install -g masty-tunnel`

---

## Notes

- Public URLs are temporary
- Intended for development and testing
- Free hosting providers may sleep during inactivity

---

## License

MIT
```
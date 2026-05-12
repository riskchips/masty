# Masty Tunnel

Masty Tunnel is a lightweight CLI tool that exposes your local server to the internet using a temporary public URL.

It forwards incoming HTTP requests directly to your localhost, making it useful for testing APIs, webhooks, development servers, and local applications without deploying them.

---

## Features

- Expose localhost to a public URL
- Supports all HTTP methods
- Supports custom routes and APIs
- Live request logging
- Request latency and response timing
- Automatic reconnect system
- Lightweight and fast
- Simple CLI interface

---

## Installation

Install globally:

```bash
npm install -g masty-tunnel
```

Or run directly with npx:

```bash
npx masty-tunnel run <port>
```

Example:

```bash
npx masty-tunnel run 3000
```

---

## Usage

Start your local server first:

```bash
node test.js
```

Then start the tunnel:

```bash
masty run 3000
```

---

## Example

If your local application is running on:

```bash
http://localhost:3000
```

Masty will generate a public URL like:

```bash
https://masty.onrender.com/e9a6c195f1752f59
```

Accessing:

```bash
https://masty.onrender.com/e9a6c195f1752f59/api/users
```

will forward the request to:

```bash
http://localhost:3000/api/users
```

---

## Console Output

```text
MASTY TUNNEL

Connected to server

URL        https://masty.onrender.com/e9a6c195f1752f59
Forward    localhost:3000
Latency    calculating...

[4:10:04 AM] 127.0.0.1 GET /e9a6c195f1752f59 200 473ms 440ms
```

---

## Notes

- Public URLs are temporary
- Intended for development and testing
- Free hosting providers may sleep during inactivity

---

## License

MIT
```
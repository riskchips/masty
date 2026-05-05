# Masty Tunnel

Masty Tunnel is a simple CLI tool that exposes your local server to the internet.

It creates a temporary public URL and forwards incoming requests to your local machine. This is useful for testing webhooks, sharing local projects, or quickly demoing an application without deploying it.

---

## Features

- Expose localhost to a public URL  
- Works with any HTTP server  
- Lightweight and easy to use  
- Minimal setup required  

---

## Installation

Install globally:

```bash
npm install masty-tunnel
``` 


```bash
npx masty-tunnel run <port>
```

example 

```bash
npx masty-tunnel run 3000
```
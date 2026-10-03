# TRADES.LOCAL 

A zero-liability, zero-database, RAM-only digital corkboard for a post-money world. 

Trades.Local is designed to facilitate local mutual aid and direct barter between neighbors. It tracks no IP addresses, requires no user accounts, and stores no chat logs. It is designed to run on a home computer and be routed to the public internet securely via Cloudflare Tunnels.

## The Architecture
* **Frontend:** Vanilla HTML/JS/CSS. No frameworks, no trackers.
* **Backend:** Node.js + Express. 
* **Storage:** Ephemeral RAM only. If the server reboots, the board wipes.
* **Reputation:** Cryptographic "punch cards" stored strictly in the user's local browser (`localStorage`).
* **Chat:** Self-destructing WebSocket tunnels. 
* **Media:** Client-side HTML5 canvas compression (WebP). The server never processes images.
* **Moderation:** Decentralized, anonymous device-based flagging system.

## Deploying Your Own Hub
You can run this on any machine that supports Node.js. 

1. Clone this repository: `git clone https://github.com/YOUR_USERNAME/trades-local.git`
2. Enter the directory: `cd trades-local`
3. Install dependencies: `npm install express ws`
4. Start the server: `node server.js`

To expose this to the internet without opening router ports, we highly recommend using **Cloudflare Tunnel (cloudflared)** to point your local Port `3000` to a custom domain.

## License
MIT License. Copy it, fork it, change it. Build your local commons.

*Co-created by Edward Burbank and Gemini.*

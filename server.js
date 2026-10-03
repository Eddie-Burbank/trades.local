const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- EPHEMERAL RAM STATE ---
let listings = []; 
let rooms = {};
let claimedListings = {}; 

setInterval(() => {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    listings = listings.filter(l => l.createdAt > cutoff);
}, 60 * 60 * 1000);

// --- REST API ROUTES ---
app.get('/api/listings', (req, res) => {
    const requestedLocation = req.query.location;
    if (requestedLocation) {
        res.json(listings.filter(l => l.location === requestedLocation));
    } else {
        res.json(listings);
    }
});

app.post('/api/listings', (req, res) => {
    try {
        const { title, description, wants, type, image, location, reputation } = req.body; 
        const listing = {
            id: Math.random().toString(36).substr(2, 9),
            title: title || 'Anything (Open to offers)', 
            description: description || '',
            wants: wants || 'Anything, surprise me', 
            type, 
            image,
            location: location || 'Global',
            reputation: reputation || 0,
            flaggedBy: [], 
            createdAt: Date.now()
        };
        listings.unshift(listing);
        console.log(`[SYS] New listing in ${listing.location} | Rep: ${listing.reputation} | ${listing.title}`);
        res.json(listing);
    } catch (err) {
        console.error('[ERR] Failed to post listing:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/accept', (req, res) => {
    try {
        const { listingId } = req.body;
        listings = listings.filter(l => l.id !== listingId); 
        
        const roomId = Math.random().toString(36).substr(2, 6);
        rooms[roomId] = [];
        claimedListings[listingId] = roomId;

        setTimeout(() => { 
            delete rooms[roomId]; 
            delete claimedListings[listingId]; 
        }, 24 * 60 * 60 * 1000);
        
        res.json({ roomId });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/check-receipts', (req, res) => {
    const { myListingIds } = req.body; 
    let notifications = [];
    if (myListingIds && Array.isArray(myListingIds)) {
        myListingIds.forEach(id => {
            if (claimedListings[id]) notifications.push({ listingId: id, roomId: claimedListings[id] });
        });
    }
    res.json(notifications);
});

app.post('/api/flag', (req, res) => {
    try {
        const { listingId, deviceId } = req.body;
        const listing = listings.find(l => l.id === listingId);
        if (!listing) return res.json({ error: 'Not found' });

        if (!listing.flaggedBy.includes(deviceId)) {
            listing.flaggedBy.push(deviceId);
        }

        if (listing.flaggedBy.length >= 3) {
            listings = listings.filter(l => l.id !== listingId);
            delete claimedListings[listingId]; 
            console.log(`[SYS] Listing ${listingId} REMOVED by community vote.`);
            return res.json({ removed: true });
        }
        res.json({ removed: false, votes: listing.flaggedBy.length });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- WEBSOCKET CHAT TUNNEL ---
wss.on('connection', (ws, req) => {
    const roomId = req.url.split('/').pop();
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(ws);

    ws.on('message', (message) => {
        rooms[roomId].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(c => c !== ws);
            if (rooms[roomId].length === 0) delete rooms[roomId]; 
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[SYS] TRADES.LOCAL Engine running on port ${PORT}.`));
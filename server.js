// Simple GitHub OAuth proxy server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'Ov23liBq2fXk8p8W4H8N';
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET'; // You need to add this

// Exchange code for access token
app.post('/api/github/auth', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error_description || 'Authentication failed' });
        }
        
        // Get user data
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!userResponse.ok) {
            return res.status(400).json({ error: 'Failed to fetch user data' });
        }
        
        const userData = await userResponse.json();
        
        res.json({
            accessToken: tokenData.access_token,
            user: userData
        });
        
    } catch (error) {
        console.error('GitHub auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`GitHub OAuth proxy server running on port ${PORT}`);
});

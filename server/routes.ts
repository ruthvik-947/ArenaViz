import type { Express } from "express";
import { createServer, type Server } from "http";
import { getArenaAuthUrl, exchangeCodeForToken, getLatestToken, deleteToken } from "./arena";

const BASE_URL = process.env.REPL_SLUG 
  ? `https://arena-channel-graph.replit.app`
  : 'http://localhost:5000';

export function registerRoutes(app: Express): Server {
  app.get("/api/arena/redirect-uri", (req, res) => {
    const redirectUri = `${BASE_URL}/api/arena/callback`;
    console.log('Providing redirect URI:', redirectUri);
    res.json({ redirectUri });
  });

  app.get("/api/arena/auth", async (req, res) => {
    try {
      const url = await getArenaAuthUrl();
      console.log('Redirecting to Are.na auth URL:', url);
      res.redirect(url);
    } catch (error) {
      console.error('Auth URL generation error:', error);
      res.status(500).send("Failed to generate authentication URL");
    }
  });

  app.get("/api/arena/callback", async (req, res) => {
    console.log('Received callback request');
    console.log('Query parameters:', req.query);

    const { code, error, error_description } = req.query;

    if (error) {
      console.error('OAuth error:', error, error_description);
      return res.status(400).send(`Authorization failed: ${error_description || error}`);
    }

    if (!code || typeof code !== 'string') {
      console.error('No valid code provided');
      return res.status(400).send("No authorization code provided");
    }

    try {
      console.log('Attempting to exchange code for token');
      await exchangeCodeForToken(code);
      res.send(`
        <script>
          window.opener.postMessage({ type: 'ARENA_AUTH_SUCCESS' }, '*');
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).send(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  app.get("/api/arena/token", async (req, res) => {
    try {
      const token = await getLatestToken();
      res.json(token);
    } catch (error) {
      console.error('Token retrieval error:', error);
      res.status(500).send("Failed to retrieve token");
    }
  });

  app.post("/api/arena/logout", async (req, res) => {
    try {
      await deleteToken();
      res.sendStatus(200);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).send("Failed to logout");
    }
  });

  app.get("/api/arena/channel/:id", async (req, res) => {
    const token = await getLatestToken();
    if (!token) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const response = await fetch(
        `https://api.are.na/v2/channels/${req.params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return res.status(response.status).send(response.statusText);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Channel fetch error:', error);
      res.status(500).send("Failed to fetch channel data");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
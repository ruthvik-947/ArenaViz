import type { Express } from "express";
import { createServer, type Server } from "http";
import { getArenaAuthUrl, exchangeCodeForToken, getLatestToken, deleteToken } from "./arena";

export function registerRoutes(app: Express): Server {
  app.get("/api/arena/redirect-uri", (req, res) => {
    const redirectUri = process.env.REPL_ID 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/arena/callback`
      : 'http://localhost:5000/api/arena/callback';
    res.json({ redirectUri });
  });

  app.get("/api/arena/auth", async (req, res) => {
    try {
      const url = await getArenaAuthUrl();
      res.redirect(url);
    } catch (error) {
      console.error('Auth URL generation error:', error);
      res.status(500).send("Failed to generate authentication URL");
    }
  });

  app.get("/api/arena/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      await exchangeCodeForToken(code as string);
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
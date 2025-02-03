import type { Express } from "express";
import { createServer, type Server } from "http";
import { getArenaAuthUrl, exchangeCodeForToken, getLatestToken, deleteToken } from "./arena";

export function registerRoutes(app: Express): Server {
  app.get("/api/arena/redirect-uri", (req, res) => {
    const redirectUri = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/arena/callback`;
    res.json({ redirectUri });
  });

  app.get("/api/arena/auth", async (req, res) => {
    const url = await getArenaAuthUrl();
    res.redirect(url);
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
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/arena/token", async (req, res) => {
    const token = await getLatestToken();
    res.json(token);
  });

  app.post("/api/arena/logout", async (req, res) => {
    await deleteToken();
    res.sendStatus(200);
  });

  app.get("/api/arena/channel/:id", async (req, res) => {
    const token = await getLatestToken();
    if (!token) {
      return res.status(401).send("Not authenticated");
    }

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
  });

  const httpServer = createServer(app);
  return httpServer;
}
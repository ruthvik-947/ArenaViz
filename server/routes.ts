import type { Express } from "express";
import { createServer, type Server } from "http";
import { getArenaAuthUrl, exchangeCodeForToken, getLatestToken, deleteToken } from "./arena";

const BASE_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.replit.app`
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
      const errorHtml = `
        <script>
          window.opener.postMessage({ 
            type: 'ARENA_AUTH_ERROR',
            error: '${error_description || error}'
          }, '*');
          window.close();
        </script>
      `;
      return res.send(errorHtml);
    }

    if (!code || typeof code !== 'string') {
      console.error('No valid code provided');
      const errorHtml = `
        <script>
          window.opener.postMessage({ 
            type: 'ARENA_AUTH_ERROR',
            error: 'No authorization code provided'
          }, '*');
          window.close();
        </script>
      `;
      return res.send(errorHtml);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorHtml = `
        <script>
          window.opener.postMessage({ 
            type: 'ARENA_AUTH_ERROR',
            error: ${JSON.stringify(errorMessage)}
          }, '*');
          window.close();
        </script>
      `;
      res.send(errorHtml);
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

  const httpServer = createServer(app);
  return httpServer;
}
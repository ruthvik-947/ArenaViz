import { db } from "@db";
import { arenaTokens } from "@db/schema";
import { eq } from "drizzle-orm";

const ARENA_CLIENT_ID = process.env.ARENA_CLIENT_ID;
const ARENA_CLIENT_SECRET = process.env.ARENA_CLIENT_SECRET;

// Use the exact domain registered with Are.na
const BASE_URL = "https://arena-channel-graph.replit.app";
const REDIRECT_URI = `${BASE_URL}/api/arena/callback`;
console.log('Configured redirect URI:', REDIRECT_URI);

export async function getArenaAuthUrl() {
  const url = new URL("https://dev.are.na/oauth/authorize");
  const params = new URLSearchParams({
    client_id: ARENA_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: "code"
  });

  const authUrl = `${url.toString()}?${params.toString()}`;
  console.log('Generated auth URL:', authUrl);
  console.log('Using redirect URI:', REDIRECT_URI);
  console.log('Client ID configured:', !!ARENA_CLIENT_ID);
  console.log('Client Secret configured:', !!ARENA_CLIENT_SECRET);

  return authUrl;
}

export async function exchangeCodeForToken(code: string) {
  console.log('Starting token exchange process');
  console.log('Using redirect URI:', REDIRECT_URI);
  console.log('Code:', code.substring(0, 5) + '...');
  console.log('Client ID configured:', !!ARENA_CLIENT_ID);
  console.log('Client Secret configured:', !!ARENA_CLIENT_SECRET);

  const tokenData = {
    client_id: ARENA_CLIENT_ID,
    client_secret: ARENA_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
  };

  console.log('Token request payload:', JSON.stringify({
    ...tokenData,
    client_secret: '[REDACTED]'
  }, null, 2));

  const res = await fetch("https://dev.are.na/oauth/token", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(tokenData),
  });

  const responseText = await res.text();
  console.log('Token response status:', res.status);
  console.log('Token response headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));

  if (!res.ok) {
    console.error('Token exchange failed');
    console.error('Response status:', res.status);
    console.error('Response text:', responseText);
    throw new Error(`Failed to exchange code for token: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  console.log('Successfully received token response');

  await db.insert(arenaTokens).values({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  return data.access_token;
}

export async function getLatestToken() {
  const [token] = await db
    .select()
    .from(arenaTokens)
    .orderBy(arenaTokens.createdAt)
    .limit(1);

  return token?.accessToken;
}

export async function deleteToken() {
  await db.delete(arenaTokens);
}
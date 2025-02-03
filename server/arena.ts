import { db } from "@db";
import { arenaTokens } from "@db/schema";
import { eq } from "drizzle-orm";

const ARENA_CLIENT_ID = process.env.ARENA_CLIENT_ID;
const ARENA_CLIENT_SECRET = process.env.ARENA_CLIENT_SECRET;
const REDIRECT_URI = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/arena/callback`;

export async function getArenaAuthUrl() {
  const url = new URL("https://dev.are.na/oauth/authorize");
  url.searchParams.set("client_id", ARENA_CLIENT_ID!);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch("https://dev.are.na/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: ARENA_CLIENT_ID,
      client_secret: ARENA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange code for token");
  }

  const data = await res.json();
  
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

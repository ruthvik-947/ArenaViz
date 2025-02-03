import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const arenaTokens = pgTable("arena_tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ArenaToken = typeof arenaTokens.$inferSelect;
export type NewArenaToken = typeof arenaTokens.$inferInsert;
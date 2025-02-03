import { pgTable, text, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";

export const arenaTokens = pgTable("arena_tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const canvasStates = pgTable("canvas_states", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull(),
  name: text("name"),
  viewSettings: jsonb("view_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blockPositions = pgTable("block_positions", {
  id: serial("id").primaryKey(),
  canvasStateId: integer("canvas_state_id").references(() => canvasStates.id),
  arenaBlockId: text("arena_block_id").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width"),
  height: integer("height"),
  isVisible: boolean("is_visible").default(true),
  customProperties: jsonb("custom_properties"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ArenaToken = typeof arenaTokens.$inferSelect;
export type NewArenaToken = typeof arenaTokens.$inferInsert;
export type CanvasState = typeof canvasStates.$inferSelect;
export type NewCanvasState = typeof canvasStates.$inferInsert;
export type BlockPosition = typeof blockPositions.$inferSelect;
export type NewBlockPosition = typeof blockPositions.$inferInsert;
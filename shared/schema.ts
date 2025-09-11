import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  hostId: varchar("host_id").notNull(),
  status: varchar("status", { enum: ["waiting", "selecting_judge", "playing", "finished"] }).notNull().default("waiting"),
  currentJudgeId: varchar("current_judge_id"),
  currentRound: integer("current_round").notNull().default(0),
  selectedPhotoCard: jsonb("selected_photo_card"),
  submittedCards: jsonb("submitted_cards").default("[]"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  name: varchar("name").notNull(),
  isOnline: boolean("is_online").notNull().default(true),
  hand: jsonb("hand").default("[]"),
  trophies: integer("trophies").notNull().default(0),
  numberCard: integer("number_card"),
  hiddenNumberCard: integer("hidden_number_card"),
  hasSubmittedCard: boolean("has_submitted_card").notNull().default(false),
  hasExchangedCard: boolean("has_exchanged_card").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().default(sql`now()`),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { enum: ["caption", "photo"] }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
});

export const gameDecks = pgTable("game_decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  captionDeck: jsonb("caption_deck").default("[]"),
  photoDeck: jsonb("photo_deck").default("[]"),
  discardPile: jsonb("discard_pile").default("[]"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  hostId: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  type: true,
  content: true,
  imageUrl: true,
  description: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type GameDeck = typeof gameDecks.$inferSelect;

// Game state types
export type GameState = {
  room: Room;
  players: Player[];
  deck: GameDeck;
};

export type CaptionCard = {
  id: string;
  text: string;
};

export type PhotoCard = {
  id: string;
  imageUrl: string;
  description: string;
};

export type SubmittedCard = {
  playerId: string;
  cardId: string;
  text: string;
};

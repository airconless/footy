import { int, integer, sqliteTable, text, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";

export const games = sqliteTable('games', {
  // Primary identifier
  id: integer('id').primaryKey(),
  
  // API identifier (auto-incrementing starting from 3101)
  apiID: integer('apiID').notNull(),
  
  // Teams
  hteam: text('hteam'), // home team name
  ateam: text('ateam'), // away team name

  
  // Match details
  year: integer('year'),
  round: integer('round'),
  roundname: text('roundname'),
  venue: text('venue'),
  
  // Timing
  unixtime: integer('unixtime'),
  
  // Scores
  hscore: integer('hscore'), // home team total score
  ascore: integer('ascore'), // away team total score
  hgoals: integer('hgoals'),
  hbehinds: integer('hbehinds'),
  agoals: integer('agoals'),
  abehinds: integer('abehinds'),
  
  // Result
  winner: text('winner'), // team name of winner (null if draw)
  
  // Status flags
  complete: integer('complete'), // completion percentage (0-100)
  is_final: integer('is_final'), // 0 or 1
  is_grand_final: integer('is_grand_final'), // 0 or 1
}, (table) => ({
  // Indexes for common queries
  yearRoundIdx: uniqueIndex('year_round_teams_idx').on(table.year, table.round),
  dateIdx: uniqueIndex('date_idx').on(table.unixtime),
  apiIDIdx: uniqueIndex('api_id_idx').on(table.apiID),
}));

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

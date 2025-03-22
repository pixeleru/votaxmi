import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (students and judges)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // "student" or "judge"
  hasVoted: boolean("has_voted").notNull().default(false),
  displayName: text("display_name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  displayName: true,
});

// Candidate schema
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url").notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  grade: true,
  description: true,
  photoUrl: true,
});

// Votes schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  userId: true,
  candidateId: true,
}).extend({
  timestamp: z.string().optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// API response types
export type CandidateWithVotes = Candidate & { votes: number };
export type VotingStats = {
  totalVotes: number;
  totalVoters: number;
  eligibleVoters: number;
  mostActiveGrade: {
    grade: number;
    participationRate: number;
  };
  timeRemaining: {
    days: number;
    closingDate: string;
  };
};

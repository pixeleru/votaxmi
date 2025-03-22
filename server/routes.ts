import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertCandidateSchema,
  insertVoteSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session data
      req.session!.userId = user.id;
      req.session!.role = user.role;

      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        hasVoted: user.hasVoted,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      return res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        hasVoted: user.hasVoted,
      });
    } catch (error) {
      console.error("Session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/candidates", async (req: Request, res: Response) => {
    try {
      const gradeParam = req.query.grade;
      let candidates;

      if (gradeParam && !isNaN(Number(gradeParam))) {
        const grade = Number(gradeParam);
        candidates = await storage.getCandidatesByGrade(grade); // Maneja los nuevos grados aquí
      } else {
        candidates = await storage.getAllCandidates();
      }

      return res.status(200).json(candidates);
    } catch (error) {
      console.error("Get candidates error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/candidates/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      const candidate = await storage.getCandidate(id);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      return res.status(200).json(candidate);
    } catch (error) {
      console.error("Get candidate error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Judge-only routes - require judge role
  app.use("/api/admin/*", async (req: Request, res: Response, next) => {
    if (req.session?.role !== "judge") {
      return res.status(403).json({ message: "Forbidden: Judges only" });
    }
    next();
  });

  app.post("/api/admin/candidates", async (req: Request, res: Response) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const newCandidate = await storage.createCandidate(candidateData);
      return res.status(201).json(newCandidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid candidate data", errors: error.errors });
      }
      console.error("Create candidate error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/candidates/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      const candidateData = req.body;
      const updatedCandidate = await storage.updateCandidate(id, candidateData);

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      return res.status(200).json(updatedCandidate);
    } catch (error) {
      console.error("Update candidate error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(
    "/api/admin/candidates/:id",
    async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid candidate ID" });
        }

        const success = await storage.deleteCandidate(id);

        if (!success) {
          return res.status(404).json({ message: "Candidate not found" });
        }

        return res.status(204).send();
      } catch (error) {
        console.error("Delete candidate error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Results routes
  app.get("/api/results", async (_req: Request, res: Response) => {
    try {
      const results = await storage.getCandidatesWithVotes();
      return res.status(200).json(results);
    } catch (error) {
      console.error("Get results error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getVotingStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Voting routes
  app.post("/api/votes", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.hasVoted) {
        return res.status(403).json({ message: "You have already voted" });
      }

      const voteData = insertVoteSchema.parse({
        ...req.body,
        userId,
      });

      // Check if candidate exists
      const candidate = await storage.getCandidate(voteData.candidateId);

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Create vote and update user
      const vote = await storage.createVote(voteData);
      await storage.updateUserVoteStatus(userId, true);

      return res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid vote data", errors: error.errors });
      }
      console.error("Create vote error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

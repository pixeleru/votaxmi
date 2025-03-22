import { candidates, type Candidate, type InsertCandidate } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";
import { votes, type Vote, type InsertVote } from "@shared/schema";
import { type CandidateWithVotes, type VotingStats } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVoteStatus(userId: number, hasVoted: boolean): Promise<void>;
  
  // Candidate methods
  getAllCandidates(): Promise<Candidate[]>;
  getCandidatesByGrade(grade: number): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByCandidate(candidateId: number): Promise<Vote[]>;
  getVotesByUser(userId: number): Promise<Vote[]>;
  
  // Statistics
  getCandidatesWithVotes(): Promise<CandidateWithVotes[]>;
  getVotingStats(): Promise<VotingStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private candidates: Map<number, Candidate>;
  private votes: Map<number, Vote>;
  
  private userIdCounter: number;
  private candidateIdCounter: number;
  private voteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.candidates = new Map();
    this.votes = new Map();
    
    this.userIdCounter = 1;
    this.candidateIdCounter = 1;
    this.voteIdCounter = 1;
    
    // Añadir solo usuario juez para acceso al panel
    this.createUser({
      username: "judge1",
      password: "juez123",
      role: "judge",
      displayName: "Juez"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || "student", // Aseguramos que role nunca sea undefined
      displayName: insertUser.displayName || null,
      hasVoted: false 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserVoteStatus(userId: number, hasVoted: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.hasVoted = hasVoted;
    this.users.set(userId, user);
  }

  // Candidate methods
  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }
  
  async getCandidatesByGrade(grade: number): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(
      (candidate) => candidate.grade === grade
    );
  }
  
  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }
  
  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateIdCounter++;
    const candidate: Candidate = { ...insertCandidate, id };
    this.candidates.set(id, candidate);
    return candidate;
  }
  
  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const candidate = await this.getCandidate(id);
    if (!candidate) return undefined;
    
    const updatedCandidate: Candidate = {
      ...candidate,
      ...candidateData
    };
    
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }
  
  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }
  
  // Vote methods
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    // Usar el timestamp del input o crear uno nuevo
    const timestamp = typeof insertVote.timestamp === 'string' 
      ? new Date(insertVote.timestamp) 
      : new Date();
    
    const vote: Vote = { 
      ...insertVote, 
      id, 
      timestamp 
    };
    this.votes.set(id, vote);
    return vote;
  }
  
  async getVotesByCandidate(candidateId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.candidateId === candidateId
    );
  }
  
  async getVotesByUser(userId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.userId === userId
    );
  }
  
  // Statistics
  async getCandidatesWithVotes(): Promise<CandidateWithVotes[]> {
    const candidates = await this.getAllCandidates();
    
    const result: CandidateWithVotes[] = [];
    
    for (const candidate of candidates) {
      const votes = await this.getVotesByCandidate(candidate.id);
      result.push({
        ...candidate,
        votes: votes.length
      });
    }
    
    // Sort by votes in descending order
    return result.sort((a, b) => b.votes - a.votes);
  }
  
  async getVotingStats(): Promise<VotingStats> {
    const allVotes = Array.from(this.votes.values());
    const totalVotes = allVotes.length;
    
    const voterIds = new Set(allVotes.map(vote => vote.userId));
    const totalVoters = voterIds.size;
    
    // Calculate eligible voters (all users with role "student")
    const students = Array.from(this.users.values()).filter(user => user.role === "student");
    const eligibleVoters = students.length;
    
    // Calculate votes by grade
    const candidates = await this.getAllCandidates();
    const gradeVoteCounts = new Map<number, number>();
    const gradeStudentCounts = new Map<number, number>();
    
    // Initialize grade counts
    for (const grade of [9, 10, 11, 12]) {
      gradeVoteCounts.set(grade, 0);
      gradeStudentCounts.set(grade, 0);
    }
    
    // Count votes per grade by looking at candidate's grade
    for (const vote of allVotes) {
      const candidate = candidates.find(c => c.id === vote.candidateId);
      if (candidate) {
        const currentCount = gradeVoteCounts.get(candidate.grade) || 0;
        gradeVoteCounts.set(candidate.grade, currentCount + 1);
      }
    }
    
    // Find the most active grade
    let mostActiveGrade = 9;
    let highestParticipationRate = 0;
    
    for (const grade of [9, 10, 11, 12]) {
      const votes = gradeVoteCounts.get(grade) || 0;
      const students = gradeStudentCounts.get(grade) || 10; // Default to 10 for the demo
      const participationRate = students > 0 ? votes / students : 0;
      
      if (participationRate > highestParticipationRate) {
        highestParticipationRate = participationRate;
        mostActiveGrade = grade;
      }
    }
    
    return {
      totalVotes,
      totalVoters,
      eligibleVoters,
      mostActiveGrade: {
        grade: mostActiveGrade,
        participationRate: highestParticipationRate
      },
      timeRemaining: {
        days: 2, // Hardcoded for the demo
        closingDate: "May 15, 2023" // Hardcoded for the demo
      }
    };
  }
}

export const storage = new MemStorage();

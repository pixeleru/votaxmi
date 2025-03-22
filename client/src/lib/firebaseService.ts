import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Candidate, InsertCandidate, Vote, InsertVote } from "@shared/schema";

// Collection references
const candidatesCollection = collection(db, "candidates");
const votesCollection = collection(db, "votes");

// Candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    const snapshot = await getDocs(candidatesCollection);
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error("Error getting candidates:", error);
    // Fallback to API if Firebase fails
    const response = await fetch('/api/candidates');
    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }
    return response.json();
  }
};

export const getCandidatesByGrade = async (grade: number): Promise<Candidate[]> => {
  try {
    const q = query(candidatesCollection, where("grade", "==", grade));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error("Error getting candidates by grade:", error);
    // Fallback to API if Firebase fails
    const response = await fetch(`/api/candidates?grade=${grade}`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidates by grade');
    }
    return response.json();
  }
};

export const getCandidate = async (id: number): Promise<Candidate | null> => {
  try {
    const docRef = doc(db, "candidates", id.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id,
        ...docSnap.data()
      } as Candidate;
    } else {
      console.log("No such candidate!");
      return null;
    }
  } catch (error) {
    console.error("Error getting candidate:", error);
    // Fallback to API if Firebase fails
    const response = await fetch(`/api/candidates/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidate');
    }
    return response.json();
  }
};

export const createCandidate = async (candidate: InsertCandidate): Promise<Candidate> => {
  try {
    console.log("Intentando crear candidato:", candidate);
    // Crear un objeto nuevo con los campos exactos para evitar campos no válidos
    const cleanCandidate = {
      name: candidate.name,
      grade: candidate.grade,
      description: candidate.description,
      photoUrl: candidate.photoUrl
    };
    
    const docRef = await addDoc(candidatesCollection, cleanCandidate);
    console.log("Candidato creado con ID:", docRef.id);
    
    return {
      id: parseInt(docRef.id),
      ...cleanCandidate
    } as Candidate;
  } catch (error) {
    console.error("Error adding candidate:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }
      
      return response.json();
    } catch (fallbackError) {
      console.error("Fallback también falló:", fallbackError);
      throw new Error('No se pudo crear el candidato: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
};

export const updateCandidate = async (id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | null> => {
  try {
    const docRef = doc(db, "candidates", id.toString());
    await updateDoc(docRef, candidate);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return {
        id,
        ...updatedDoc.data()
      } as Candidate;
    }
    return null;
  } catch (error) {
    console.error("Error updating candidate:", error);
    // Fallback to API if Firebase fails
    const response = await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update candidate');
    }
    
    return response.json();
  }
};

export const deleteCandidate = async (id: number): Promise<boolean> => {
  try {
    const docRef = doc(db, "candidates", id.toString());
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    // Fallback to API if Firebase fails
    const response = await fetch(`/api/admin/candidates/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete candidate');
    }
    
    return true;
  }
};

// Votes
export const createVote = async (vote: InsertVote): Promise<Vote> => {
  try {
    // Store in localStorage that user has voted
    localStorage.setItem('hasVoted', 'true');
    
    const docRef = await addDoc(votesCollection, vote);
    return {
      id: parseInt(docRef.id),
      ...vote
    } as Vote;
  } catch (error) {
    console.error("Error adding vote:", error);
    // Fallback to API if Firebase fails
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vote),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create vote');
    }
    
    return response.json();
  }
};

export const getVotesByCandidate = async (candidateId: number): Promise<Vote[]> => {
  try {
    const q = query(votesCollection, where("candidateId", "==", candidateId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Vote));
  } catch (error) {
    console.error("Error getting votes by candidate:", error);
    // Fall back to API if Firebase fails
    const response = await fetch(`/api/votes?candidateId=${candidateId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch votes by candidate');
    }
    return response.json();
  }
};

// Statistics
export const getCandidatesWithVotes = async () => {
  try {
    // Get all candidates
    const candidates = await getCandidates();
    
    // Get votes for each candidate
    const candidatesWithVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const votes = await getVotesByCandidate(candidate.id);
        return {
          ...candidate,
          votes: votes.length
        };
      })
    );
    
    return candidatesWithVotes;
  } catch (error) {
    console.error("Error getting candidates with votes:", error);
    // Fallback to API if Firebase fails
    const response = await fetch('/api/results');
    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }
    return response.json();
  }
};
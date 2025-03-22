import { ref, set, push, get, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { db } from "@/lib/firebase";
import { Candidate, InsertCandidate, Vote, InsertVote } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// Database references
const candidatesRef = ref(db, "candidates");
const votesRef = ref(db, "votes");

// Función auxiliar para convertir los datos de Firebase a array
const firebaseToArray = <T>(snapshot: any, idField = 'id'): T[] => {
  const result: T[] = [];
  
  console.log("Procesando firebaseToArray, ¿snapshot existe?", snapshot !== null);
  console.log("¿snapshot.exists()?", snapshot && snapshot.exists ? snapshot.exists() : "no existe método");
  
  if (snapshot && snapshot.exists && snapshot.exists()) {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`Procesando entrada con key=${key}`, value);
        // Asegurarnos de que value es un objeto antes de hacer spread
        if (typeof value === 'object' && value !== null) {
          const item = {
            [idField]: Number(key) || key,
            ...(value as object)
          } as unknown as T;
          
          console.log("Ítem procesado:", item);
          result.push(item);
        }
      });
    }
  } else {
    // Intentar obtener los datos directamente
    console.log("Intentando obtener datos directamente de snapshot.val()...");
    try {
      const directData = snapshot && snapshot.val ? snapshot.val() : null;
      
      if (directData && typeof directData === 'object') {
        console.log("Datos obtenidos directamente:", directData);
        Object.entries(directData).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const item = {
              [idField]: Number(key) || key,
              ...(value as object)
            } as unknown as T;
            
            console.log("Ítem procesado (método alternativo):", item);
            result.push(item);
          }
        });
      }
    } catch (error) {
      console.error("Error al procesar datos directamente:", error);
    }
  }
  
  console.log("Resultado final de firebaseToArray:", result);
  return result;
};

// Candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    console.log("Obteniendo candidatas desde Firebase Realtime DB");
    const snapshot = await get(candidatesRef);
    return firebaseToArray<Candidate>(snapshot);
  } catch (error) {
    console.error("Error getting candidates:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      return response.json();
    } catch (err) {
      console.error("API fallback failed:", err);
      return []; // Retornar array vacío en caso de fallo total
    }
  }
};

export const getCandidatesByGrade = async (grade: number): Promise<Candidate[]> => {
  try {
    const candidatesQuery = query(candidatesRef, orderByChild("grade"), equalTo(grade));
    const snapshot = await get(candidatesQuery);
    return firebaseToArray<Candidate>(snapshot);
  } catch (error) {
    console.error("Error getting candidates by grade:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch(`/api/candidates?grade=${grade}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates by grade');
      }
      return response.json();
    } catch (err) {
      console.error("API fallback failed:", err);
      return []; // Retornar array vacío en caso de fallo total
    }
  }
};

export const getCandidate = async (id: number): Promise<Candidate | null> => {
  try {
    const candidateRef = ref(db, `candidates/${id}`);
    const snapshot = await get(candidateRef);
    
    if (snapshot.exists()) {
      return {
        id,
        ...snapshot.val()
      } as Candidate;
    } else {
      console.log("No existe la candidata solicitada");
      return null;
    }
  } catch (error) {
    console.error("Error getting candidate:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch(`/api/candidates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidate');
      }
      return response.json();
    } catch (err) {
      console.error("API fallback failed:", err);
      return null;
    }
  }
};

export const createCandidate = async (candidate: InsertCandidate): Promise<Candidate> => {
  try {
    console.log("Intentando crear candidata en Realtime Database:", candidate);
    
    // Crear un objeto nuevo con los campos exactos para evitar campos no válidos
    const cleanCandidate = {
      name: candidate.name,
      grade: candidate.grade,
      description: candidate.description,
      photoUrl: candidate.photoUrl || ""
    };
    
    // Crear un ID numérico basado en timestamp
    const timestamp = new Date().getTime();
    const newId = timestamp;
    
    // Guardar con el ID numérico como clave
    await set(ref(db, `candidates/${newId}`), cleanCandidate);
    
    console.log("Candidata creada con ID:", newId);
    
    return {
      id: newId,
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
      throw new Error('No se pudo crear la candidata: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
};

export const updateCandidate = async (id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | null> => {
  try {
    const candidateRef = ref(db, `candidates/${id}`);
    
    // Actualizar solo los campos proporcionados
    await update(candidateRef, candidate);
    
    // Obtener el documento actualizado
    const snapshot = await get(candidateRef);
    if (snapshot.exists()) {
      return {
        id,
        ...snapshot.val()
      } as Candidate;
    }
    return null;
  } catch (error) {
    console.error("Error updating candidate:", error);
    // Fallback to API if Firebase fails
    try {
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
    } catch (err) {
      console.error("API fallback failed:", err);
      return null;
    }
  }
};

export const deleteCandidate = async (id: number): Promise<boolean> => {
  try {
    const candidateRef = ref(db, `candidates/${id}`);
    await remove(candidateRef);
    return true;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch(`/api/admin/candidates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }
      
      return true;
    } catch (err) {
      console.error("API fallback failed:", err);
      return false;
    }
  }
};

// Votes
export const createVote = async (vote: InsertVote): Promise<Vote> => {
  try {
    // Store in localStorage that user has voted
    localStorage.setItem('hasVoted', 'true');
    
    // Create new vote with timestamp
    const voteData = {
      ...vote,
      timestamp: new Date().toISOString()
    };
    
    // Crear un ID numérico basado en timestamp
    const timestamp = new Date().getTime();
    const newId = timestamp;
    
    // Save with numerical ID as key
    await set(ref(db, `votes/${newId}`), voteData);
    
    return {
      id: newId,
      ...voteData
    } as Vote;
  } catch (error) {
    console.error("Error adding vote:", error);
    // Fallback to API if Firebase fails
    try {
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
    } catch (err) {
      console.error("API fallback failed:", err);
      throw new Error('No se pudo registrar el voto');
    }
  }
};

export const getVotesByCandidate = async (candidateId: number): Promise<Vote[]> => {
  try {
    const votesQuery = query(votesRef, orderByChild("candidateId"), equalTo(candidateId));
    const snapshot = await get(votesQuery);
    return firebaseToArray<Vote>(snapshot);
  } catch (error) {
    console.error("Error getting votes by candidate:", error);
    // Fall back to API if Firebase fails
    try {
      const response = await fetch(`/api/votes?candidateId=${candidateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch votes by candidate');
      }
      return response.json();
    } catch (err) {
      console.error("API fallback failed:", err);
      return [];
    }
  }
};

// Función para reiniciar las elecciones (eliminar todos los votos)
export const resetElection = async (): Promise<boolean> => {
  try {
    console.log("Reiniciando elecciones - eliminando todos los votos...");
    await set(ref(db, "votes"), null); // Eliminar todos los votos
    
    // Eliminar el registro de voto local
    localStorage.removeItem('hasVoted');
    
    // Invalidar las consultas para actualizar la interfaz
    queryClient.invalidateQueries({ queryKey: ['/api/results'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
    queryClient.invalidateQueries({ queryKey: ['/api/votes'] });
    
    return true;
  } catch (error) {
    console.error("Error al reiniciar las elecciones:", error);
    return false;
  }
};

// Función para limpiar todas las candidatas
export const resetCandidates = async (): Promise<boolean> => {
  try {
    console.log("Eliminando todas las candidatas...");
    await set(ref(db, "candidates"), null); // Eliminar todas las candidatas
    
    // Invalidar las consultas para actualizar la interfaz
    queryClient.invalidateQueries({ queryKey: ['/api/results'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
    
    return true;
  } catch (error) {
    console.error("Error al eliminar todas las candidatas:", error);
    return false;
  }
};

// Statistics
export const getCandidatesWithVotes = async () => {
  try {
    // Get all candidates
    const candidates = await getCandidates();
    console.log("getCandidatesWithVotes - candidates obtenidas:", candidates);
    
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
    
    console.log("candidatesWithVotes resultado:", candidatesWithVotes);
    return candidatesWithVotes;
  } catch (error) {
    console.error("Error getting candidates with votes:", error);
    // Fallback to API if Firebase fails
    try {
      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      return response.json();
    } catch (err) {
      console.error("API fallback failed:", err);
      return [];
    }
  }
};
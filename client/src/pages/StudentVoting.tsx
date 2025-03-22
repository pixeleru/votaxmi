import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import CandidateCard from "@/components/CandidateCard";
import CandidateDetailsModal from "@/components/CandidateDetailsModal";
import VoteConfirmationModal from "@/components/VoteConfirmationModal";
import VoteSuccessModal from "@/components/VoteSuccessModal";
import GradeFilter from "@/components/GradeFilter";
import { Candidate } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

const StudentVoting = () => {
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);

  // Check if the user has already voted using localStorage
  useEffect(() => {
    const voted = localStorage.getItem('hasVoted') === 'true';
    setHasVoted(voted);
  }, []);

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVoteConfirmationOpen, setIsVoteConfirmationOpen] = useState(false);
  const [isVoteSuccessOpen, setIsVoteSuccessOpen] = useState(false);

  // Fetch candidates
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: [selectedGrade ? `/api/candidates?grade=${selectedGrade}` : '/api/candidates'],
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (candidateId: number) => {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          // Using a temporary user ID since we're not requiring login
          userId: Date.now() // Generate a unique ID based on timestamp
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cast vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Mark as voted in localStorage
      localStorage.setItem('hasVoted', 'true');
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
    },
    onError: (error) => {
      toast({
        title: "Vote failed",
        description: error instanceof Error ? error.message : "Failed to cast your vote",
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const handleVote = (candidate: Candidate) => {
    if (hasVoted) {
      toast({
        title: "Ya has votado",
        description: "Solo puedes votar una vez",
        variant: "destructive",
      });
      return;
    }

    setSelectedCandidate(candidate);
    setIsVoteConfirmationOpen(true);
  };

  const handleConfirmVote = () => {
    if (selectedCandidate) {
      voteMutation.mutate(selectedCandidate.id);
      setIsVoteConfirmationOpen(false);
      setIsVoteSuccessOpen(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start">
          <TabsTrigger 
            value="student"
            className="py-4 px-4 font-sans text-sm md:text-base data-[state=active]:border-b-[3px] data-[state=active]:border-[#FF69B4] data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            Votación Estudiantil
          </TabsTrigger>
          <TabsTrigger 
            value="judge"
            className="py-4 px-4 font-sans text-sm md:text-base text-gray-500 disabled:opacity-50"
            onClick={() => window.location.href = "/judge"}
          >
            Panel de Jueces
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="mt-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary font-sans">Votación para Reina Escolar</h2>
            <p className="text-gray-600 mb-6">Selecciona tu candidata favorita. Solo puedes votar una vez, ¡así que elige sabiamente!</p>
            
            {hasVoted && (
              <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-200 rounded-md">
                ¡Ya has votado! Gracias por tu participación.
              </div>
            )}
            
            <GradeFilter selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} />
            
            {isLoadingCandidates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow">
                    <Skeleton className="w-full h-64" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-6 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates?.map((candidate: Candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onViewDetails={handleViewDetails}
                    onVote={handleVote}
                    hasVoted={hasVoted}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCandidate && (
        <>
          <CandidateDetailsModal
            candidate={selectedCandidate}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onVote={handleVote}
            hasVoted={hasVoted}
          />
          
          <VoteConfirmationModal
            candidate={selectedCandidate}
            isOpen={isVoteConfirmationOpen}
            onClose={() => setIsVoteConfirmationOpen(false)}
            onConfirm={handleConfirmVote}
          />
          
          <VoteSuccessModal
            isOpen={isVoteSuccessOpen}
            onClose={() => setIsVoteSuccessOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default StudentVoting;

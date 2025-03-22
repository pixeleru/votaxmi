import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CandidateCard from "@/components/CandidateCard";
import CandidateDetailsModal from "@/components/CandidateDetailsModal";
import VoteConfirmationModal from "@/components/VoteConfirmationModal";
import VoteSuccessModal from "@/components/VoteSuccessModal";
import GradeFilter from "@/components/GradeFilter";
import { Candidate } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const StudentVoting = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVoteConfirmationOpen, setIsVoteConfirmationOpen] = useState(false);
  const [isVoteSuccessOpen, setIsVoteSuccessOpen] = useState(false);

  // Fetch candidates
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: [selectedGrade ? `/api/candidates?grade=${selectedGrade}` : '/api/candidates'],
    enabled: !!user,
  });

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const handleVote = (candidate: Candidate) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }

    if (user.hasVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote",
        variant: "destructive",
      });
      return;
    }

    setSelectedCandidate(candidate);
    setIsVoteConfirmationOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start">
          <TabsTrigger 
            value="student"
            className="py-4 px-4 font-sans text-sm md:text-base data-[state=active]:border-b-[3px] data-[state=active]:border-[#FF69B4] data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            Student Voting
          </TabsTrigger>
          <TabsTrigger 
            value="judge"
            disabled={!user || user.role !== "judge"}
            className="py-4 px-4 font-sans text-sm md:text-base text-gray-500 disabled:opacity-50"
          >
            Judge Panel
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="mt-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary font-sans">Vote for School Queen</h2>
            <p className="text-gray-600 mb-6">Select your favorite candidate. You can only vote once, so choose wisely!</p>
            
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
                    hasVoted={user?.hasVoted || false}
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
            hasVoted={user?.hasVoted || false}
          />
          
          <VoteConfirmationModal
            candidate={selectedCandidate}
            isOpen={isVoteConfirmationOpen}
            onClose={() => setIsVoteConfirmationOpen(false)}
            onConfirm={() => {
              setIsVoteConfirmationOpen(false);
              setIsVoteSuccessOpen(true);
            }}
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

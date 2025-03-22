import { useQuery } from "@tanstack/react-query";
import { type CandidateWithVotes, type VotingStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import * as firebaseService from "@/lib/firebaseService";

const gradeNames: Record<number, string> = {
  1: "Tercero Técnico",
  2: "Segundo Técnico",
  3: "Primero General A",
  4: "Primero General B",
  5: "Primero General C",
  6: "Segundo General A",
  7: "Segundo General B",
  8: "Noveno Grado A",
  9: "Noveno Grado B",
  10: "Octavo Grado A",
  11: "Octavo Grado B",
  12: "Séptimo Grado A",
  13: "Séptimo Grado B",
  14: "Sexto Grado A",
  15: "Sexto Grado B",
};

const ResultsSection = () => {
  const { data: results, isLoading: isLoadingResults } = useQuery({
    queryKey: ['/api/results'],
    queryFn: async () => {
      return firebaseService.getCandidatesWithVotes();
    }
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      // This is a fallback since we don't implement the full stats in Firebase yet
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Return default stats if API fails
        return {
          totalVotes: results?.reduce((sum, candidate) => sum + candidate.votes, 0) || 0,
          totalVoters: 0,
          eligibleVoters: 500,
          mostActiveGrade: {
            grade: 12,
            participationRate: 0.75
          },
          timeRemaining: {
            days: 7,
            closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        } as VotingStats;
      }
    },
    enabled: !!results
  });

  // Calculate total votes
  const totalVotes = results?.reduce((sum: number, candidate: CandidateWithVotes) => sum + candidate.votes, 0) || 0;

  return (
    <div>
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary font-sans">Live Voting Results</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Updating live</span>
          </div>

          <div className="results-graph space-y-6">
            {isLoadingResults ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center mb-2">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div className="w-full">
                      <Skeleton className="h-5 w-1/3 mb-1" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-6 w-full rounded-full" />
                </div>
              ))
            ) : (
              results?.map((candidate: CandidateWithVotes) => {
                const votePercentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;

                return (
                  <div key={candidate.id} className="result-item">
                    <div className="flex items-center mb-2">
                      <img 
                        src={candidate.photoUrl} 
                        className="w-10 h-10 rounded-full object-cover mr-3" 
                        alt={candidate.name} 
                      />
                      <div className="w-full">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-primary">{candidate.name}</h4>
                          <span className="grade-pill ml-2 text-xs bg-primary text-white rounded-2xl px-2 py-0.5">
                          {gradeNames[candidate.grade]}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{candidate.votes} votes</span>
                          <span>{votePercentage}%</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={votePercentage} className="h-6 bg-gray-100 rounded-full">
                      <div 
                        className="h-full bg-[#FFD700] rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${votePercentage}%` }}
                      />
                    </Progress>
                  </div>
                );
              })
            )}

            <div className="total-votes mt-8 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Votes:</span>
                <span className="font-semibold">{totalVotes}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="statistics-section grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isLoadingStats ? (
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="bg-white rounded-lg shadow">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;

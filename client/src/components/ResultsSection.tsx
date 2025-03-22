import { useQuery } from "@tanstack/react-query";
import { type CandidateWithVotes, type VotingStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const ResultsSection = () => {
  const { data: results, isLoading: isLoadingResults } = useQuery({
    queryKey: ['/api/results']
  });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats']
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
                            Grade {candidate.grade}
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
            <Card className="bg-white rounded-lg shadow">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Total Voters</h4>
                <p className="text-3xl font-bold text-primary">{stats?.totalVoters || 0}</p>
                <p className="text-xs text-gray-500">
                  Out of {stats?.eligibleVoters || 0} eligible students
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-lg shadow">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Most Active Grade</h4>
                <p className="text-3xl font-bold text-primary">
                  Grade {stats?.mostActiveGrade?.grade || '-'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.mostActiveGrade?.participationRate
                    ? `${Math.round(stats.mostActiveGrade.participationRate * 100)}% participation rate`
                    : 'No votes recorded yet'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-lg shadow">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Time Remaining</h4>
                <p className="text-3xl font-bold text-[#FF69B4]">{stats?.timeRemaining?.days || 0} days</p>
                <p className="text-xs text-gray-500">
                  Voting closes on {stats?.timeRemaining?.closingDate || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;

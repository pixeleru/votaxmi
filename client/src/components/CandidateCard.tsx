import { type Candidate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CandidateCardProps {
  candidate: Candidate;
  onViewDetails: (candidate: Candidate) => void;
  onVote: (candidate: Candidate) => void;
  hasVoted: boolean;
}

const CandidateCard = ({ candidate, onViewDetails, onVote, hasVoted }: CandidateCardProps) => {
  return (
    <Card className="candidate-card bg-white rounded-lg overflow-hidden shadow transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img 
          src={candidate.photoUrl} 
          alt={`Candidate ${candidate.name}`} 
          className="w-full h-64 object-cover"
        />
        <span className="grade-pill absolute top-3 right-3 bg-primary text-white rounded-2xl px-2 py-0.5 text-xs">
          Grade {candidate.grade}
        </span>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-primary font-sans">{candidate.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{candidate.description}</p>
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => onVote(candidate)}
            disabled={hasVoted}
            className={`bg-[#FF69B4] hover:bg-[#ff4da6] text-white py-2 px-4 rounded font-semibold text-sm transition-all ${
              hasVoted ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {hasVoted ? "Vote Recorded" : "Cast Your Vote"}
          </Button>
          <Button 
            variant="link" 
            onClick={() => onViewDetails(candidate)}
            className="text-primary text-sm underline"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;

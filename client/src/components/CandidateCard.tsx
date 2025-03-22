import { type Candidate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CandidateCardProps {
  candidate: Candidate;
  onViewDetails: (candidate: Candidate) => void;
  onVote: (candidate: Candidate) => void;
  hasVoted: boolean;
}

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

const CandidateCard = ({ candidate, onViewDetails, onVote, hasVoted }: CandidateCardProps) => {
  return (
    <Card className="candidate-card bg-white rounded-lg overflow-hidden shadow transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <span className="grade-pill absolute top-3 right-3 bg-primary text-white rounded-2xl px-2 py-0.5 text-xs">
          {gradeNames[candidate.grade]}
        </span>
      </div>
      <CardContent className="p-4 flex items-center">
        <div className="flex-1">
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
              {hasVoted ? "Ya has votado" : "Votar"}
            </Button>
          </div>
        </div>
        <div className="ml-4">
          <img 
            src={candidate.photoUrl}
            alt="Icono" 
            className="w-16 h-16 object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;

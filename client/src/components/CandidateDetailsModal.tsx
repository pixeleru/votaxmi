import { type Candidate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface CandidateDetailsModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onVote: (candidate: Candidate) => void;
  hasVoted: boolean;
}

const CandidateDetailsModal = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onVote, 
  hasVoted 
}: CandidateDetailsModalProps) => {
  // Mock achievements for the candidate
  const achievements = [
    "Student Council Member (2 years)",
    "Debate Team Captain",
    "Honor Roll Student",
    "Community Service Award",
    "Regional Science Fair Finalist",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          <img 
            src={candidate.photoUrl} 
            alt={`${candidate.name} profile`} 
            className="w-full h-64 object-cover"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-1"
          >
            <X className="h-6 w-6 text-gray-600" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent py-4 px-6">
            <div className="flex items-center">
              <span className="grade-pill mr-2 bg-primary text-white rounded-2xl px-2 py-0.5 text-xs">
                Grade {candidate.grade}
              </span>
              <h3 className="text-2xl font-semibold text-white font-sans">{candidate.name}</h3>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-primary mb-2 font-sans">About</h4>
            <p className="text-gray-700">{candidate.description}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-primary mb-2 font-sans">Achievements</h4>
            <ul className="list-disc list-inside text-gray-700">
              {achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <Button 
              onClick={() => onVote(candidate)}
              disabled={hasVoted}
              className={`bg-[#FF69B4] hover:bg-[#ff4da6] text-white py-2 px-6 rounded font-semibold transition-all ${
                hasVoted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {hasVoted ? "Vote Recorded" : "Cast Your Vote"}
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-gray-600 text-sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailsModal;

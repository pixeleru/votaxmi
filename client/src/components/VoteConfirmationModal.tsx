import { useState } from "react";
import { type Candidate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface VoteConfirmationModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VoteConfirmationModal = ({ 
  candidate, 
  isOpen, 
  onClose,
  onConfirm
}: VoteConfirmationModalProps) => {
  const { updateUserVoteStatus } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmVote = async () => {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/votes", { candidateId: candidate.id });
      
      // Update user's vote status
      updateUserVoteStatus(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Vote recorded",
        description: `Your vote for ${candidate.name} has been recorded successfully.`,
      });
      
      onConfirm();
    } catch (error) {
      console.error("Vote confirmation error:", error);
      toast({
        title: "Voting failed",
        description: error instanceof Error ? error.message : "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center p-6">
        <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary mb-2 font-sans">Vote Confirmation</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to vote for <span className="font-semibold">{candidate.name}</span>? 
          You can only vote once in this election.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleConfirmVote}
            disabled={isSubmitting}
            className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-[#3a0066] transition-all"
          >
            {isSubmitting ? "Processing..." : "Confirm Vote"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded font-semibold"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteConfirmationModal;

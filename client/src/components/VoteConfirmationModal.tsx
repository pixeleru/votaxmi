import { useState } from "react";
import { type Candidate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { createVote } from "@/lib/firebaseService";

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmVote = async () => {
    try {
      setIsSubmitting(true);
      
      // Usando Firebase directamente en lugar de la API
      await createVote({ 
        candidateId: candidate.id,
        userId: 0, // Usuario anónimo
        timestamp: new Date().toISOString()
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Voto registrado",
        description: `Tu voto para ${candidate.name} ha sido registrado exitosamente.`,
      });
      
      onConfirm();
    } catch (error) {
      console.error("Vote confirmation error:", error);
      toast({
        title: "Error al votar",
        description: error instanceof Error ? error.message : "No se pudo registrar tu voto. Por favor intenta nuevamente.",
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
        <h3 className="text-xl font-semibold text-primary mb-2 font-sans">Confirmación de Voto</h3>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro que quieres votar por <span className="font-semibold">{candidate.name}</span>? 
          Solo puedes votar una vez en esta elección.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleConfirmVote}
            disabled={isSubmitting}
            className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-[#3a0066] transition-all"
          >
            {isSubmitting ? "Procesando..." : "Confirmar Voto"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded font-semibold"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteConfirmationModal;

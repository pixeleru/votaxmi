import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface VoteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoteSuccessModal = ({ isOpen, onClose }: VoteSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center p-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2 font-sans">¡Tu voto ha sido registrado!</h3>
        <p className="text-gray-600 mb-6">
          Gracias por votar y participar en la elección de la Reina Estudiantil Intramuros XXVI
        </p>
        <Button 
          onClick={onClose}
          className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-[#3a0066] transition-all"
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default VoteSuccessModal;

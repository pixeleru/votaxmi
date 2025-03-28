import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleJudgePanel = () => {
    setLocation("/judge");
  };

  return (
    <header className="bg-primary shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white text-xl md:text-2xl font-bold font-sans">Vota X Mi</h1>
        </div>
        <div className="text-white font-sans text-sm">
          <Button
            onClick={handleJudgePanel}
            className="bg-secondary text-[#333333] py-2 px-4 rounded font-semibold text-sm hover:bg-[#e6c200] transition-all"
          >
            Jueces
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

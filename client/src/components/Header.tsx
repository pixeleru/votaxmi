import { useAuth } from "@/contexts/AuthContext";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const Header = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/login");
  };

  return (
    <header className="bg-primary shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Crown className="h-8 w-8 text-secondary mr-2" />
          <h1 className="text-white text-xl md:text-2xl font-bold font-sans">School Queen Voting System</h1>
        </div>
        <div className="text-white font-sans text-sm">
          {user ? (
            <div className="flex items-center">
              <span className="mr-2">{user.displayName || user.username}</span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-primary py-1 px-3 rounded text-xs"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogin}
              className="bg-secondary text-[#333333] py-2 px-4 rounded font-semibold text-sm hover:bg-[#e6c200] transition-all"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

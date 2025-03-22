import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ResultsSection from "@/components/ResultsSection";
import CandidateManagement from "@/components/CandidateManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const JudgePanel = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("results");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Verificar si el usuario ya estaba autenticado
    const authenticated = localStorage.getItem('judgeAuthenticated') === 'true';
    if (authenticated) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
    }
  }, []);
  
  const handleLogin = () => {
    setIsLoading(true);
    
    // Simular tiempo de carga
    setTimeout(() => {
      if (password === "juez123") {
        setIsAuthenticated(true);
        setShowLoginDialog(false);
        localStorage.setItem('judgeAuthenticated', 'true');
        toast({
          title: "Acceso concedido",
          description: "Bienvenido al panel de jueces",
        });
      } else {
        toast({
          title: "Acceso denegado",
          description: "La contraseña es incorrecta",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Si no está autenticado, redirigir a la pantalla de inicio
  if (!isAuthenticated && !showLoginDialog) {
    toast({
      title: "Acceso denegado",
      description: "Necesitas autenticarte para acceder al panel de jueces",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acceso al Panel de Jueces</DialogTitle>
            <DialogDescription>
              Introduce la contraseña para acceder al panel de administración de jueces.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Ingresa la contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setLocation("/")} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acceder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isAuthenticated && (
        <Tabs defaultValue="judge" className="w-full">
          <TabsList className="bg-white border-b border-gray-200 w-full justify-start">
            <TabsTrigger 
              value="student"
              onClick={() => setLocation("/")}
              className="py-4 px-4 font-sans text-sm md:text-base text-gray-500"
            >
              Votación Estudiantil
            </TabsTrigger>
            <TabsTrigger 
              value="judge"
              className="py-4 px-4 font-sans text-sm md:text-base data-[state=active]:border-b-[3px] data-[state=active]:border-[#FF69B4] data-[state=active]:text-primary data-[state=active]:font-semibold"
            >
              Panel de Jueces
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="judge" className="mt-6">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary font-sans">Panel de Administración de Jueces</h2>
                <p className="text-sm text-gray-500">Gestiona candidatas y visualiza resultados en tiempo real</p>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                <button 
                  className={`py-2 px-4 rounded text-sm font-semibold ${
                    activeTab === "results" 
                      ? "bg-primary text-white" 
                      : "bg-white border border-primary text-primary"
                  }`}
                  onClick={() => setActiveTab("results")}
                >
                  Resultados
                </button>
                <button 
                  className={`py-2 px-4 rounded text-sm font-semibold ${
                    activeTab === "management" 
                      ? "bg-primary text-white" 
                      : "bg-white border border-primary text-primary"
                  }`}
                  onClick={() => setActiveTab("management")}
                >
                  Gestión de Candidatas
                </button>
                <button 
                  className="py-2 px-4 rounded text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    localStorage.removeItem('judgeAuthenticated');
                    setIsAuthenticated(false);
                    setShowLoginDialog(true);
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {activeTab === "results" ? (
              <ResultsSection />
            ) : (
              <CandidateManagement />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default JudgePanel;

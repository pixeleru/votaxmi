import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ResultsSection from "@/components/ResultsSection";
import CandidateManagement from "@/components/CandidateManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const JudgePanel = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("results");

  // Redirect if not a judge
  if (!user || user.role !== "judge") {
    toast({
      title: "Access denied",
      description: "You need to be logged in as a judge to access this page",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start">
          <TabsTrigger 
            value="student"
            onClick={() => setLocation("/")}
            className="py-4 px-4 font-sans text-sm md:text-base text-gray-500"
          >
            Student Voting
          </TabsTrigger>
          <TabsTrigger 
            value="judge"
            className="py-4 px-4 font-sans text-sm md:text-base data-[state=active]:border-b-[3px] data-[state=active]:border-[#FF69B4] data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            Judge Panel
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="judge" className="mt-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary font-sans">Judge Administration Panel</h2>
            <div className="flex space-x-3">
              <button 
                className={`py-2 px-4 rounded text-sm font-semibold ${
                  activeTab === "results" 
                    ? "bg-primary text-white" 
                    : "bg-white border border-primary text-primary"
                }`}
                onClick={() => setActiveTab("results")}
              >
                Results
              </button>
              <button 
                className={`py-2 px-4 rounded text-sm font-semibold ${
                  activeTab === "management" 
                    ? "bg-primary text-white" 
                    : "bg-white border border-primary text-primary"
                }`}
                onClick={() => setActiveTab("management")}
              >
                Candidate Management
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
    </div>
  );
};

export default JudgePanel;

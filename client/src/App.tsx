import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import StudentVoting from "@/pages/StudentVoting";
import JudgePanel from "@/pages/JudgePanel";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

function App() {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Redirect based on authentication status
  useEffect(() => {
    if (loading) return;

    if (!user && location !== "/login") {
      setLocation("/login");
    } else if (user) {
      // If logged in as judge and not on judge panel, redirect to judge panel
      if (user.role === "judge" && location === "/login") {
        setLocation("/judge");
      }
      // If logged in as student and on login page, redirect to voting
      else if (user.role === "student" && location === "/login") {
        setLocation("/");
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={StudentVoting} />
          <Route path="/judge" component={JudgePanel} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;

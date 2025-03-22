import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import StudentVoting from "@/pages/StudentVoting";
import JudgePanel from "@/pages/JudgePanel";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function App() {
  const [location] = useLocation();

  useEffect(() => {
    switch (location) {
      case "/login":
        document.title = "Login - School Royal Vote";
        break;
      case "/":
        document.title = "Elección";
        break;
      case "/judge":
        document.title = "Panel de Juez";
        break;
      default:
        document.title = "404";
    }
  }, [location]);

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
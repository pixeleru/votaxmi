import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import StudentVoting from "@/pages/StudentVoting";
import JudgePanel from "@/pages/JudgePanel";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function App() {
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

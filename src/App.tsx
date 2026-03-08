import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Violations from "./pages/Violations";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import AppShell from "./components/layout/AppShell";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
          <Route path="/journal" element={<AppShell><Journal /></AppShell>} />
          <Route path="/analytics" element={<AppShell><Analytics /></AppShell>} />
          <Route path="/violations" element={<AppShell><Violations /></AppShell>} />
          <Route path="/notes" element={<AppShell><Notes /></AppShell>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

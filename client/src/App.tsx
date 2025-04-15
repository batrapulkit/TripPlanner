import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveChatbot from "@/components/LiveChatbot";

// Pages
import Home from "@/pages/Home";
import MyTrips from "@/pages/MyTrips";
import ItineraryDetails from "@/pages/ItineraryDetails";
import Explore from "@/pages/Explore";
import Hotels from "@/pages/Hotels";
import Events from "@/pages/Events";
import Feed from "@/pages/Feed";
import About from "@/pages/About";
import ARVR from "@/pages/ARVR";
import Pricing from "@/pages/Pricing";
import Signup from "@/pages/Signup";    
import Signin from "@/pages/Signin";     
import NotFound from "@/pages/not-found";
import Flights from "@/pages/Flights";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-trips" component={MyTrips} />
      <Route path="/itinerary/:id" component={ItineraryDetails} />
      <Route path="/explore" component={Explore} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/flights" component={Flights} />
      <Route path="/events" component={Events} />
      <Route path="/feed" component={Feed} />
      <Route path="/about" component={About} />
      <Route path="/ar-vr" component={ARVR} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/signup" component={Signup} />
      <Route path="/signin" component={Signin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col font-inter text-dark">
        <Header />
        <main className="flex-grow pt-16">
          <Router />
        </main>
        <Footer />
        <LiveChatbot />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

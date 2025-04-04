import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminPanel from "@/pages/AdminPanel";
import VideoPlayer from "@/pages/VideoPlayer";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { UserRole } from "@shared/schema";

// Import placeholder pages for navigation links
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white p-4">
    <h1 className="text-3xl font-bold text-[#E50914] mb-4">{title}</h1>
    <p className="text-center max-w-md mb-6">
      This page is under construction. More content will be added soon.
    </p>
  </div>
);

const TVShows = () => <PlaceholderPage title="TV Shows" />;
const Movies = () => <PlaceholderPage title="Movies" />;
const NewAndPopular = () => <PlaceholderPage title="New & Popular" />;
const MyList = () => <PlaceholderPage title="My List" />;
const Profile = () => <PlaceholderPage title="User Profile" />;
const HelpCenter = () => <PlaceholderPage title="Help Center" />;

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <Route path="/auth" component={Login} />
      <Route path="/login" component={Login} /> {/* For backward compatibility */}
      <AdminRoute path="/admin" component={AdminPanel} />
      <ProtectedRoute path="/watch/:type/:id" component={VideoPlayer} />
      <ProtectedRoute path="/tv-shows" component={TVShows} />
      <ProtectedRoute path="/movies" component={Movies} />
      <ProtectedRoute path="/new" component={NewAndPopular} />
      <ProtectedRoute path="/my-list" component={MyList} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/help" component={HelpCenter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;


import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-neon-pink">404</h1>
        <p className="text-xl text-foreground mb-8">Oops! This page has gone missing.</p>
        <div className="w-full max-w-xs mx-auto mb-8 h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green"></div>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

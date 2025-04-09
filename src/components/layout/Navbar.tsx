
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, BarChart2, Dumbbell, Home, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Don't show navbar on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const navLinks = [
    { name: 'Home', icon: <Home className="w-5 h-5" />, href: '/' },
    { name: 'Workouts', icon: <Dumbbell className="w-5 h-5" />, href: '/workouts' },
    { name: 'Progress', icon: <BarChart2 className="w-5 h-5" />, href: '/progress' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, href: '/profile' },
  ];

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:top-0 md:bottom-auto md:border-t-0 md:border-b',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {!isMobile && (
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl neon-text-pink">HW</span>
              <span className="font-medium">Planner</span>
            </Link>
          )}
          
          <div className="flex items-center justify-around md:justify-end w-full md:w-auto gap-1 md:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex flex-col md:flex-row items-center justify-center p-2 md:px-4 rounded-md hover:bg-secondary transition-colors"
              >
                <span className="md:mr-2">{link.icon}</span>
                <span className="text-xs md:text-sm">{link.name}</span>
              </Link>
            ))}
            
            {user && !isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="ml-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

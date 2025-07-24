
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const isLoggedIn = !!user;
  const userRole = user?.role || null;
  
  const handleHostClick = () => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: '/business/home',
          role: 'business'
        }
      });
    } else if (userRole !== 'business') {
      toast.error('Only business accounts can access host features');
    } else {
      navigate('/business/home');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-pacers-blue text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="app-container">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/3a7543e3-e2ed-467f-9d9b-bc4ff8eda842.png" 
              alt="Comovo" 
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl">COMOVO</span>
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/runs" className="hover:text-opacity-80 transition-colors">
              Find Runs
            </NavLink>
            
            {isLoggedIn && userRole === 'runner' && (
              <NavLink to="/my-runs" className="hover:text-opacity-80 transition-colors">
                My Runs
              </NavLink>
            )}
            
            {isLoggedIn && userRole === 'business' && (
              <NavLink to="/business/create-run" className="hover:text-opacity-80 transition-colors">
                Create Run
              </NavLink>
            )}
            
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="border-white text-pacers-blue bg-white flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="border-white text-pacers-blue bg-white">
                <NavLink to="/login">Login</NavLink>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-4">
            <NavLink 
              to="/runs" 
              className="block py-2 hover:bg-pacers-blue-light px-2 rounded" 
              onClick={() => setIsMenuOpen(false)}
            >
              Find Runs
            </NavLink>
            
            {isLoggedIn && userRole === 'runner' && (
              <NavLink 
                to="/my-runs" 
                className="block py-2 hover:bg-pacers-blue-light px-2 rounded" 
                onClick={() => setIsMenuOpen(false)}
              >
                My Runs
              </NavLink>
            )}
            
            {isLoggedIn && userRole === 'business' && (
              <NavLink 
                to="/business/create-run" 
                className="block py-2 hover:bg-pacers-blue-light px-2 rounded" 
                onClick={() => setIsMenuOpen(false)}
              >
                Create Run
              </NavLink>
            )}
            
            <div className="pt-2 border-t border-pacers-blue-light">
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full text-black border-white bg-white hover:bg-white hover:text-black flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-full text-black border-white bg-white hover:bg-white"
                >
                  <NavLink to="/login" className="w-full block text-black">
                    Login
                  </NavLink>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

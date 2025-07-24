
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-pacers-blue text-white py-8 mt-16">
      <div className="app-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/3a7543e3-e2ed-467f-9d9b-bc4ff8eda842.png" 
                alt="Comovo" 
                className="h-8 w-auto"
              />
              <h3 className="font-bold text-xl">COMOVO</h3>
            </div>
            <p className="text-sm opacity-80">
              Connecting runners with local community runs hosted by businesses.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/runs" className="hover:underline">Find Runs</Link>
              </li>
              <li>
                <Link to="/my-runs" className="hover:underline">My Runs</Link>
              </li>
              <li>
                <Link to="/business/home" className="hover:underline">Business Home</Link>
              </li>
              <li>
                <Link to="/login" className="hover:underline">Login / Sign Up</Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold mb-2">About Comovo</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:underline">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-pacers-blue-light mt-6 pt-6 text-sm opacity-80 text-center">
          <p>&copy; {new Date().getFullYear()} Comovo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

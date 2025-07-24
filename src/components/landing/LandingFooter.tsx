import React from 'react';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
const LandingFooter = () => {
  return <footer className="bg-[#003444] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold">comovo</h2>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
          
          {/* Launch Message */}
          <div className="text-[#2EC4B6] font-medium mb-8">
        </div>
          
          {/* Links */}
          <div className="flex justify-center space-x-8 text-sm opacity-70">
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Press</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
          </div>
          
          {/* Copyright */}
          <div className="pt-8 border-t border-white border-opacity-10 text-sm opacity-50">
            © 2024 Comovo. Moving communities forward.
          </div>
        </div>
      </div>
    </footer>;
};
export default LandingFooter;
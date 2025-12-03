import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950/30 backdrop-blur-sm mt-20">
      {/* Sponsor Banners */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-4">
        <a href="https://discord.gg/fivemtools" target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-900/50 hover:border-fuchsia-500/50 transition-all">
          <img 
            src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/letraserverlistgif.gif"
            alt="Sponsor Banner" 
            className="w-full h-auto"
            loading="lazy"
          />
        </a>
        <a href="https://discord.gg/tZXg4GVRM5" target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-900/50 hover:border-fuchsia-500/50 transition-all">
          <img 
            src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/serverlist_iteration_1.gif"
            alt="Sponsor Banner" 
            className="w-full h-auto"
            loading="lazy"
          />
        </a>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png" 
                alt="FiveM Tools Logo" 
                className="w-8 h-8 rounded-lg object-cover" 
              />
              <span className="font-bold text-lg text-white">FiveM Tools V7</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              The ultimate resource hub for FiveM developers and server owners. High-quality assets, scripts, and community support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-zinc-100 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/explore?category=script" className="hover:text-fuchsia-400 transition-colors">Scripts</Link></li>
              <li><Link to="/explore?category=vehicle" className="hover:text-fuchsia-400 transition-colors">Vehicles</Link></li>
              <li><Link to="/explore?category=mlo" className="hover:text-fuchsia-400 transition-colors">Maps & MLO</Link></li>
              <li><Link to="/community" className="hover:text-fuchsia-400 transition-colors">Community Forum</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-zinc-100 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/about" className="hover:text-fuchsia-400 transition-colors">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-fuchsia-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-fuchsia-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-fuchsia-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-zinc-100 mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <img src="https://img.icons8.com/3d-fluency/94/github.png" className="w-6 h-6" alt="GitHub" />
              </a>
              <a href="https://discord.gg/fivemtools" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-indigo-400 transition-colors">
                <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-6 h-6" alt="Discord" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-pink-500 transition-colors">
                <img src="https://img.icons8.com/3d-fluency/94/instagram-new.png" className="w-6 h-6" alt="Instagram" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} FiveM Tools V7. All rights reserved. Not affiliated with Rockstar Games.
          </p>
          <div className="flex gap-6 text-xs text-zinc-600">
            <Link to="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link to="/terms" className="hover:text-zinc-400">Terms</Link>
            <Link to="/cookies" className="hover:text-zinc-400">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

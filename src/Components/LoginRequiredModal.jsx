import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/Components/ui/button';

export default function LoginRequiredModal({ isOpen, onClose, message = 'You must login first to access this feature' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-fuchsia-500/30 rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(217,70,239,0.3)] animate-in zoom-in duration-300">
        {/* 3D Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
            <img 
              src="https://img.icons8.com/3d-fluency/94/lock.png" 
              className="w-24 h-24 relative z-10 animate-bounce" 
              alt="Lock" 
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-3">
          Login Required
        </h2>

        {/* Message */}
        <p className="text-center text-zinc-400 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => base44.auth.login()}
            className="w-full h-12 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-bold text-lg shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all hover:scale-105"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-6 h-6 mr-2" alt="Discord" />
            Login with Discord
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full h-10 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-fuchsia-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}

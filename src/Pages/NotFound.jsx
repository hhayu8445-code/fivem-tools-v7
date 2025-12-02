import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/Components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse"></div>
        <h1 className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-800 select-none">
          404
        </h1>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
          <img src="https://img.icons8.com/3d-fluency/94/back.png" className="w-4 h-4" alt="Back" />
          Go Back
        </Button>
        <Button asChild className="bg-fuchsia-600 hover:bg-fuchsia-700 gap-2">
          <Link to="/">
            <img src="https://img.icons8.com/3d-fluency/94/home.png" className="w-4 h-4" alt="Home" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

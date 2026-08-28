"use client";

import React, { useEffect, useState } from 'react';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash for 3 seconds, then trigger fade-out animation.
    const displayTimer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 400); // 400ms match transition-opacity duration
      return () => clearTimeout(removeTimer);
    }, 3000);

    return () => clearTimeout(displayTimer);
  }, []);

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FBF7EE] transition-opacity duration-400 ease-out select-none ${
          isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Subtle dashed border inset from screen edges as ticket-stub nod */}
        <div className="absolute inset-4 border-2 border-dashed border-[#14213D]/15 rounded-2xl pointer-events-none" />

        {/* Center content container */}
        <div className="flex flex-col items-center justify-center max-w-[280px] w-full text-center space-y-6">
          
          {/* Logo Brand Mark & Icon */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src="/brand/gazie-commute-icon.png"
                alt="Gazie Commute"
                className="w-24 h-24 object-contain rounded-2xl border border-[#14213D]/10 shadow-sm animate-pulse"
              />
            </div>
            
            {/* Wordmark */}
            <div className="flex flex-col">
              <h1 className="font-display font-extrabold text-2xl tracking-wider text-[#14213D]">
                GAZIE <span className="text-[#FFC93C]">COMMUTE</span>
              </h1>
              <span className="font-mono text-[9px] tracking-widest text-[#14213D]/40 uppercase mt-1">
                ABUJA & ENVIRONS
              </span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-[11px] font-bold text-[#2D6A4F] tracking-widest uppercase font-sans">
            VERIFIED RIDES &middot; TRUSTED ROUTES
          </p>

          {/* Staggered pulsing load sequence */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span 
              className="w-2.5 h-2.5 rounded-full bg-[#FFC93C] animate-pulse" 
              style={{ animationDelay: '0ms', animationDuration: '1.2s' }} 
            />
            <span 
              className="w-2.5 h-2.5 rounded-full bg-[#FFC93C] animate-pulse" 
              style={{ animationDelay: '200ms', animationDuration: '1.2s' }} 
            />
            <span 
              className="w-2.5 h-2.5 rounded-full bg-[#FFC93C] animate-pulse" 
              style={{ animationDelay: '400ms', animationDuration: '1.2s' }} 
            />
          </div>

        </div>

        {/* Bottom Text Footer */}
        <div className="absolute bottom-8 font-mono text-[10px] text-[#14213D]/50 tracking-wider">
          Abuja &middot; Nigeria
        </div>
      </div>

      {/* Children remain mounted and load in background underneath layout */}
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}

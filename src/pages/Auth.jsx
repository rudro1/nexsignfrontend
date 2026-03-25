import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';

export default function Auth({ initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  // URL change hole jate state update hoy
  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 ">
      {/* Main Container */}
      <div className="relative w-full max-w-4xl h-[650px] bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] overflow-hidden flex">
        
        {/* Forms Container (Right and Left Sides) */}
        <div className="relative flex w-full h-full">
          
          {/* REGISTER FORM SIDE (Left half on desktop) */}
          <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full transition-all duration-700 ease-in-out ${isLogin ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
            <Register toggle={() => setIsLogin(true)} />
          </div>

          {/* LOGIN FORM SIDE (Right half on desktop) */}
          <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
            <Login toggle={() => setIsLogin(false)} />
          </div>

        </div>

        {/* ANIMATED OVERLAY PANEL (The Blue Sliding Box) */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 bg-sky-600 text-white z-20 transition-transform duration-700 ease-in-out hidden md:flex flex-col items-center justify-center p-12 text-center shadow-2xl
          ${isLogin ? 'translate-x-0 rounded-r-[100px]' : 'translate-x-full rounded-l-[100px]'}`}
        >
          {/* Dynamic Content based on isLogin */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">
              {isLogin ? "Welcome Back!" : "Let's Get Started!"}
            </h2>
            <p className="opacity-90 leading-relaxed text-lg">
              {isLogin 
                ? "To stay connected with us please login with your personal info." 
                : "Enter your personal details and start your journey with NeXsign."}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="px-12 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-sky-600 transition-all active:scale-95"
            >
              {isLogin ? "SIGN UP" : "SIGN IN"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
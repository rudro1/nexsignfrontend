
// import React, { createContext, useContext, useState, useEffect } from 'react';

// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import app from "../firebase.js"; 

// // google provider
// const googleProvider = new GoogleAuthProvider();
// const auth = getAuth(app);  // 👈 declare auth

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null); // ✅ টোকেন স্টেট যোগ করা হয়েছে
//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     const loadStoredAuth = () => {
//       try {
//         const savedUser = localStorage.getItem('nexsign_user');
//         const savedToken = localStorage.getItem('token'); // ✅ টোকেন লোড করা

//         if (savedUser && savedToken) {
//           setUser(JSON.parse(savedUser));
//           setToken(savedToken);
//         }
//       } catch (error) {
//         console.error("Error loading auth from storage:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadStoredAuth();
//   }, []);

// // google sign In
//  const googleLogin = () => {
//        setLoading(true)
//     return signInWithPopup(auth, googleProvider);
//   };




//   // লগইন ফাংশন আপডেট করা হয়েছে (userData এবং userToken দুইটাই নিবে)
//   const login = (userData, userToken) => {
//     setUser(userData);
//     setToken(userToken);
//     localStorage.setItem('nexsign_user', JSON.stringify(userData));
//     localStorage.setItem('token', userToken); // ✅ টোকেন সেভ করা হচ্ছে
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('nexsign_user');
//     localStorage.removeItem('token'); // ✅ টোকেন রিমুভ করা
//     //window.location.href = '/login';
//   };

//   const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
//   const isSuperAdmin = user?.role === 'super_admin';

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       token, // ✅ টোকেন এক্সপোর্ট করা হলো
//       loading, 
//       login, 
//       logout,
//       googleLogin, //google log In
//       isAdmin,
//       isSuperAdmin,
//       isAuthenticated: !!user 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



// src/lib/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase.config.js";
import { signInWithPopup } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("nexsign_user");
      const savedToken = localStorage.getItem("token");
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.error("Google login error:", error);
      throw error;
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("nexsign_user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("nexsign_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        googleLogin,
        isAdmin: user?.role === "admin" || user?.role === "super_admin",
        isSuperAdmin: user?.role === "super_admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
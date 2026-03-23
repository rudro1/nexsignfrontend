

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext'; 
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/Card';
// import { toast } from 'sonner';
// import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
// import { FcGoogle } from "react-icons/fc";

// export default function Login() {
//   const navigate = useNavigate();
//   const { login,googleLogin } = useAuth(); 
  
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const payload = { 
//         email: formData.email.toLowerCase().trim(), 
//         password: formData.password 
//       };

//       const res = await api.post('/auth/login', payload);
      
//       if (res.data.token) {
//         // ১. Auth Context আপডেট করা
//         login(res.data.user, res.data.token); 
//         toast.success('লগইন সফল হয়েছে!');

//         // ✅ ২. রোল অনুযায়ী রিডাইরেক্ট লজিক (এটিই আসল ফিক্স)
//         const userRole = res.data.user.role;
        
//         if (userRole === 'super_admin' || userRole === 'admin') {
//           // যদি অ্যাডমিন বা সুপার অ্যাডমিন হয়, তবে /admin রাউটে যাবে
//           navigate('/admin'); 
//         } else {
//           // সাধারণ ইউজার হলে /dashboard রাউটে যাবে
//           navigate('/dashboard');
//         }
//       }
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };



// //     //  GOOGLE LOGIN 
// //   const handleGoogleLogin = async () => {
// //   try {
// //     setLoading(true);
// //     const result = await googleLogin();
// //     const user = result.user;

// //     // সার্ভারে ডেটা পাঠানো
// //     const response = await fetch("http://localhost:5001/api/auth/google", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         name: user.displayName,
// //         email: user.email,
// //         photoURL: user.photoURL,
// //       }),
// //     });

// //     const data = await response.json();

// //     if (response.ok) {
// //       // এটিই গুরুত্বপূর্ণ: Context আপডেট করা
// //       login(data.user, data.token); 
// //       toast.success("Google Login Successful!");
      
// //       // রোল অনুযায়ী নেভিগেট
// //       if (data.user.role === 'super_admin' || data.user.role === 'admin') {
// //         navigate('/admin');
// //       } else {
// //         navigate('/dashboard');
// //       }
// //     } else {
// //       throw new Error(data.message);
// //     }
// //   } catch (error) {
// //     console.error(error);
// //     toast.error("Google Login Failed!");
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// const handleGoogleLogin = async () => {
//   try {
//     setLoading(true);
//     // ১. ফায়ারবেস/পপআপ থেকে ইউজার ডাটা আনা
//     const result = await googleLogin();
//     const user = result.user;

//     // ২. সার্ভারে ডেটা পাঠানো (apiClient ব্যবহার করে)
//     // এটি ভালো কারণ এটি অটোমেটিক প্রোডাকশন ইউআরএল হ্যান্ডেল করবে
//     const res = await api.post("/auth/google", {
//       name: user.displayName,
//       email: user.email,
//       photoURL: user.photoURL,
//     });

//     if (res.status === 200 || res.status === 201) {
//       const { user: userData, token } = res.data;

//       // ৩. Context আপডেট এবং নেভিগেশন
//       login(userData, token); 
//       toast.success("Google Login Successful!");
      
//       // রোল অনুযায়ী রিডাইরেক্ট (অ্যাডমিন চেক)
//       if (userData.role === 'super_admin' || userData.role === 'admin') {
//         navigate('/admin');
//       } else {
//         navigate('/dashboard');
//       }
//     }
//   } catch (error) {
//     console.error("Google Auth Client Error:", error);
//     const errorMsg = error.response?.data?.message || "Google Login Failed!";
//     toast.error(errorMsg);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
//       <Card className="w-full max-w-md p-8 shadow-2xl border-none rounded-3xl bg-white dark:bg-slate-900">
//         <div className="text-center mb-10">
//           <div className="w-16 h-16 bg-sky-50 hover:bg-sky-200  dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <Link to="/"><LogIn className="h-8 w-8 text-sky-500 " /></Link>
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NexSign</h1>
//           <p className="text-slate-500 mt-2">Welcome back</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="space-y-2">
//             <Label className="text-slate-700 dark:text-slate-300">Your Email</Label>
//             <Input
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="name@example.com"
//               className="h-12 rounded-xl focus:ring-sky-500 border-slate-200"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <Label className="text-slate-700 dark:text-slate-300">password</Label>
//               <Link to="/forgot-password" size="sm" className="text-xs text-sky-500 hover:underline">Forget Your password</Link>
//             </div>
//             <div className="relative">
//               <Input
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="h-12 rounded-xl focus:ring-sky-500 border-slate-200 pr-10"
//                 required
//               />
//               <button 
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               >
//                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <Button 
//             type="submit" 
//             className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/20 font-semibold" 
//             disabled={loading}
//           >
//             {loading ? (
//               <span className="flex items-center gap-2">
//                 <Loader2 className="w-4 h-4 animate-spin" /> Singing...
//               </span>
//             ) : 'Sign In'}
//           </Button>
//         </form>

//           <Button
//             onClick={handleGoogleLogin}
//             className="w-full flex mt-5 items-center justify-center gap-3 bg-white text-black py-3 rounded-lg hover:bg-gray-200"
//           >
//             <FcGoogle size={22} />
//             Continue with Google
//           </Button>

//         <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
//           <p className="text-slate-500 text-sm">
//             New here? {' '}
//             <Link to="/register" className="text-sky-500 font-bold hover:underline">
//              Sign up
//             </Link>
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }



import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";

export default function Login({ toggle }) {
  const navigate = useNavigate();
  const { login, googleLogin, user } = useAuth(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

    // 🔹 Redirect immediately if user already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { email: formData.email.toLowerCase().trim(), password: formData.password };
      const res = await api.post('/auth/login', payload);
      if (res.data.token) {
        login(res.data.user, res.data.token); 
        toast.success('Successfully loging!');
        const userRole = res.data.user.role;
        navigate(userRole === 'super_admin' || userRole === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await googleLogin();
      const user = result.user;
      const res = await api.post("/auth/google", {
        name: user.displayName, email: user.email, photoURL: user.photoURL,
      });
      if (res.status === 200 || res.status === 201) {
        login(res.data.user, res.data.token); 
         navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard',  { replace: true }), 
   
      
        toast.success("Google Login Successful!");
       
      }
    } catch (error) {
      toast.error("Google Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Link to="/"><LogIn className="h-6 w-6 text-sky-500" /></Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back to NexSign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full text-left">
        <div className="space-y-1">
          <Label className="text-sm">Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="h-10 rounded-xl" required />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Password</Label>
            <Link to="/forgot-password" size="sm" className="text-xs text-sky-500 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="••••••••" className="h-10 rounded-xl pr-10" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
        </Button>
      </form>

      <div className="max-w-sm mx-auto w-full">
        <Button onClick={handleGoogleLogin} className="w-full mt-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-black py-2 rounded-xl hover:bg-gray-50">
          <FcGoogle size={18} /> Continue with Google
        </Button>
        <p className="text-center mt-4 text-slate-500 text-xs md:hidden">
          New here? <button onClick={toggle} className="text-sky-500 font-bold">Sign Up</button>
        </p>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { LogIn } from 'lucide-react';

// export default function Login() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const res = await api.post('/auth/login', { email, password });
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data.user));
//       toast.success('Login successful');
//       navigate('/dashboard');
//     } catch (err) {
//       console.error("❌ Login error:", err.response?.data);
//       toast.error(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
//         <div className="text-center mb-8">
//           <LogIn className="h-12 w-12 text-sky-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
//           <p className="text-slate-500">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <Label>Email</Label>
//             <Input
//               type="email"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               required
//               autoComplete="email"
//             />
//           </div>
//           <div>
//             <Label>Password</Label>
//             <Input
//               type="password"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//               autoComplete="current-password"
//             />
//           </div>
//           <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </Button>
//         </form>

//         <p className="text-center mt-4 text-slate-500">
//           Don't have an account?{' '}
//           <a href="/register" className="text-sky-500 hover:underline">
//             Register
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext'; // আপনার তৈরি করা AuthContext
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // Context থেকে লগইন ফাংশন নিন
  
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
//       // ইমেইল নরমালিশন (সব ছোট হাতের করা)
//       const payload = { 
//         email: formData.email.toLowerCase().trim(), 
//         password: formData.password 
//       };

//       const res = await api.post('/auth/login', payload);
      
//       // ✅ Auth Context এবং localStorage আপডেট (login function handle করবে)
//       if (res.data.token) {
//         login(res.data.user, res.data.token); 
//         toast.success('লগইন সফল হয়েছে!');
//         navigate('/dashboard');
//       }
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
//       <Card className="w-full max-w-md p-8 shadow-2xl border-none rounded-3xl bg-white dark:bg-slate-900">
//         <div className="text-center mb-10">
//           <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <LogIn className="h-8 w-8 text-sky-500" />
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NexSign</h1>
//           <p className="text-slate-500 mt-2">আপনার অ্যাকাউন্টে সাইন-ইন করুন</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="space-y-2">
//             <Label className="text-slate-700 dark:text-slate-300">ইমেইল অ্যাড্রেস</Label>
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
//               <Label className="text-slate-700 dark:text-slate-300">পাসওয়ার্ড</Label>
//               <Link to="/forgot-password" size="sm" className="text-xs text-sky-500 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
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
//                 <Loader2 className="w-4 h-4 animate-spin" /> সাইন-ইন হচ্ছে...
//               </span>
//             ) : 'সাইন-ইন'}
//           </Button>
//         </form>

//         <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
//           <p className="text-slate-500 text-sm">
//             নতুন ইউজার?{' '}
//             <Link to="/register" className="text-sky-500 font-bold hover:underline">
//               অ্যাকাউন্ট তৈরি করুন
            
//             </Link>
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = { 
        email: formData.email.toLowerCase().trim(), 
        password: formData.password 
      };

      const res = await api.post('/auth/login', payload);
      
      if (res.data.token) {
        // ১. Auth Context আপডেট করা
        login(res.data.user, res.data.token); 
        toast.success('লগইন সফল হয়েছে!');

        // ✅ ২. রোল অনুযায়ী রিডাইরেক্ট লজিক (এটিই আসল ফিক্স)
        const userRole = res.data.user.role;
        
        if (userRole === 'super_admin' || userRole === 'admin') {
          // যদি অ্যাডমিন বা সুপার অ্যাডমিন হয়, তবে /admin রাউটে যাবে
          navigate('/admin'); 
        } else {
          // সাধারণ ইউজার হলে /dashboard রাউটে যাবে
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-none rounded-3xl bg-white dark:bg-slate-900">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-sky-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NexSign</h1>
          <p className="text-slate-500 mt-2">আপনার অ্যাকাউন্টে সাইন-ইন করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">ইমেইল অ্যাড্রেস</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="h-12 rounded-xl focus:ring-sky-500 border-slate-200"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-slate-700 dark:text-slate-300">পাসওয়ার্ড</Label>
              <Link to="/forgot-password" size="sm" className="text-xs text-sky-500 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
            </div>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 rounded-xl focus:ring-sky-500 border-slate-200 pr-10"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/20 font-semibold" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> সাইন-ইন হচ্ছে...
              </span>
            ) : 'সাইন-ইন'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            নতুন ইউজার?{' '}
            <Link to="/register" className="text-sky-500 font-bold hover:underline">
              অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
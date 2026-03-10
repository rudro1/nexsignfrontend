// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { UserPlus } from 'lucide-react';

// export default function Register() {
//   const navigate = useNavigate();
//   const [full_name, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const res = await api.post('/auth/register', { 
//         full_name, 
//         email, 
//         password 
//       });
      
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data.user));
//       toast.success('Registration successful');
//       navigate('/dashboard');
//     } catch (err) {
//       console.error("❌ Register error:", err.response?.data);
//       toast.error(err.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
//         <div className="text-center mb-8">
//           <UserPlus className="h-12 w-12 text-sky-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
//           <p className="text-slate-500">Sign up to get started</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <Label>Full Name</Label>
//             <Input
//               type="text"
//               value={full_name}
//               onChange={e => setFullName(e.target.value)}
//               placeholder="John Doe"
//               required
//               autoComplete="name"
//             />
//           </div>
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
//               autoComplete="new-password"
//             />
//           </div>
//           <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={loading}>
//             {loading ? 'Creating account...' : 'Sign Up'}
//           </Button>
//         </form>

//         <p className="text-center mt-4 text-slate-500">
//           Already have an account?{' '}
//           <a href="/login" className="text-sky-500 hover:underline">
//             Login
//           </a>
//         </p>
//       </div>
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
import { Card } from "../components/ui/Card.jsx";
import { toast } from 'sonner';
import { UserPlus, Loader2, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext থেকে লগইন মেথড

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ১. পাসওয়ার্ড ম্যাচ চেক
    if (formData.password !== formData.confirm_password) {
      return toast.error('পাসওয়ার্ড দুটি মেলেনি!');
    }

    // ২. পাসওয়ার্ড লেন্থ চেক
    if (formData.password.length < 6) {
      return toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    }

    setLoading(true);
    
    try {
      const payload = { 
        full_name: formData.full_name.trim(),
        email: formData.email.toLowerCase().trim(), 
        password: formData.password 
      };

      const res = await api.post('/auth/register', payload);
      
      // ✅ রেজিস্ট্রেশনের পর সরাসরি লগইন স্টেট আপডেট
      if (res.data.token) {
        login(res.data.user, res.data.token);
        toast.success('অ্যাকাউন্ট তৈরি সফল হয়েছে!');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-none rounded-3xl bg-white dark:bg-slate-900">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-sky-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 mt-1">NexSign-এ আপনার যাত্রা শুরু করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>পুরো নাম</Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>ইমেইল অ্যাড্রেস</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>পাসওয়ার্ড</Label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>কনফার্ম পাসওয়ার্ড</Label>
              <Input
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900/20">
            <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
            <p className="text-[11px] text-sky-700 dark:text-sky-400">
              আপনার পাসওয়ার্ডটি এনক্রিপ্টেড এবং সুরক্ষিত থাকবে।
            </p>
          </div>

          <Button type="submit" className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'অ্যাকাউন্ট তৈরি করুন'}
          </Button>
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm">
          অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="text-sky-500 font-bold hover:underline">
            লগইন করুন
          </Link>
        </p>
      </Card>
    </div>
  );
}
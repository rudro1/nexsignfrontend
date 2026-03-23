

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from "../components/ui/Card.jsx";
// import { toast } from 'sonner';
// import { UserPlus, Loader2, ShieldCheck } from 'lucide-react';

// export default function Register() {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // AuthContext থেকে লগইন মেথড

//   const [formData, setFormData] = useState({
//     full_name: '',
//     email: '',
//     password: '',
//     confirm_password: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // ১. পাসওয়ার্ড ম্যাচ চেক
//     if (formData.password !== formData.confirm_password) {
//       return toast.error('পাসওয়ার্ড দুটি মেলেনি!');
//     }

//     // ২. পাসওয়ার্ড লেন্থ চেক
//     if (formData.password.length < 6) {
//       return toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
//     }

//     setLoading(true);
    
//     try {
//       const payload = { 
//         full_name: formData.full_name.trim(),
//         email: formData.email.toLowerCase().trim(), 
//         password: formData.password 
//       };

//       const res = await api.post('/auth/register', payload);
      
//       // ✅ রেজিস্ট্রেশনের পর সরাসরি লগইন স্টেট আপডেট
//       if (res.data.token) {
//         login(res.data.user, res.data.token);
//         toast.success('অ্যাকাউন্ট তৈরি সফল হয়েছে!');
//         navigate('/dashboard');
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে';
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
//       <Card className="w-full max-w-md p-8 shadow-2xl border-none rounded-3xl bg-white dark:bg-slate-900">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-sky-50 hover:bg-sky-200 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
//            <Link to="/"> <UserPlus className="h-8 w-8 text-sky-500" /></Link>
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
//           <p className="text-slate-500 mt-1">Launch your journey with NexSign</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="space-y-2">
//             <Label>Full Name</Label>
//             <Input
//               name="full_name"
//               value={formData.full_name}
//               onChange={handleChange}
//               placeholder="John Doe"
//               className="h-11 rounded-xl"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Email Address</Label>
//             <Input
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="john@example.com"
//               className="h-11 rounded-xl"
//               required
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Password</Label>
//               <Input
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="h-11 rounded-xl"
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label>Confirm password</Label>
//               <Input
//                 name="confirm_password"
//                 type="password"
//                 value={formData.confirm_password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="h-11 rounded-xl"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-2 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900/20">
//             <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
//             <p className="text-[11px] text-sky-700 dark:text-sky-400">
//              Your password stays encrypted and safe.
//             </p>
//           </div>

//           <Button type="submit" className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20" disabled={loading}>
//             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create an account'}
//           </Button>
//         </form>

//         <p className="text-center mt-6 text-slate-500 text-sm">
//           Already have an account?{' '}
//           <Link to="/login" className="text-sky-500 font-bold hover:underline">
//          Log in
//           </Link>
//         </p>
//       </Card>
//     </div>
//   );
// }




  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (formData.password !== formData.confirm_password) return toast.error('Passwords do not match!');
  //   setLoading(true);
  //   try {
  //     const payload = { full_name: formData.full_name, email: formData.email.toLowerCase(), password: formData.password };
  //     const res = await api.post('/auth/register', payload);
  //     if (res.data.token) {
  //       login(res.data.user, res.data.token);
  //       toast.success('Account created successfully!');
  //       navigate('/dashboard');
  //     }
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Registration failed.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Register.jsx এর ভেতর handleSubmit আপডেট করুন

// Register.jsx এর handleSubmit আপডেট করুন




import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';


//import { auth } from '@/firebase.config';


export default function Register({ toggle }) {
  const navigate = useNavigate();
  const { registerWithEmail,  checkEmailVerified, login } = useAuth();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false); //
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  // ১. বেসিক ভ্যালিডেশন
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) return toast.error("Invalid email format!");
  if (formData.password !== formData.confirm_password) return toast.error('Passwords do not match!');
  if (formData.password.length < 6) return toast.error('Password too short!');

  setLoading(true);
  let firebaseUser = null;

  try {
    // ২. Firebase Registration (অ্যাকাউন্ট তৈরি ও মেইল পাঠানো)
    const result = await registerWithEmail(formData.email, formData.password);
    firebaseUser = result.user;

    setIsWaiting(true); 
    toast.info("Verification email sent! Check your inbox.");

    // ৩. পোলিং শুরু (ইমেইল ভেরিফাই হওয়া পর্যন্ত অপেক্ষা)
    const interval = setInterval(async () => {
      const isVerified = await checkEmailVerified(firebaseUser); 
      
      if (isVerified) {
        clearInterval(interval);
        
        try {
          // ৪. ইমেইল ভেরিফাই হওয়ার পরেই কেবল ব্যাকএন্ডে ডাটা সেভ হবে
          const payload = { 
            full_name: formData.full_name, 
            email: formData.email.toLowerCase().trim(),
            password: formData.password 
          };
          const res = await api.post('/auth/register', payload);

          // সেশন সেট এবং ড্যাশবোর্ডে পাঠানো
          login(res.data.user, res.data.token); 
          toast.success("Registration Complete!");
          navigate('/dashboard');
        } catch (backendErr) {
          toast.error("Verified but failed to save in database.");
        }
      }
    }, 3000);

    // ১০ মিনিট পর পোলিং বন্ধ
    setTimeout(() => clearInterval(interval), 600000);

  } catch (err) {
    setLoading(false);
    console.error("Error:", err);
    toast.error(err.message || "Registration failed.");
  }
};

  return (
    <div className="w-full h-full p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
      <div className="text-center mb-5">
        <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Link to="/"><UserPlus className="h-6 w-6 text-sky-500" /></Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
        <p className="text-slate-500 text-sm mt-1">Join NexSign today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto w-full text-left">
        <div className="space-y-1"><Label className="text-sm">Full Name</Label>
          <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="h-9 rounded-xl" required />
        </div>
        <div className="space-y-1"><Label className="text-sm">Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="h-9 rounded-xl" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-sm">Password</Label>
            <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••" className="h-9 rounded-xl" required />
          </div>
          <div className="space-y-1"><Label className="text-sm">Confirm</Label>
            <Input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} placeholder="••••" className="h-9 rounded-xl" required />
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100">
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
          <p className="text-[10px] text-sky-700 leading-tight">Password stays encrypted and safe.</p>
        </div>
        <Button type="submit" className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg font-semibold" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
        </Button>
      </form>
      <p className="text-center mt-4 text-slate-500 text-xs md:hidden">
        Already have an account? <button onClick={toggle} className="text-sky-500 font-bold">Log in</button>
      </p>
    </div>
  );
}
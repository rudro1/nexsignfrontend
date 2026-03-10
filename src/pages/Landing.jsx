// // import React, { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { createPageUrl } from '@/utils';

// // import { Button } from '@/components/ui/button';
// // import { motion } from 'framer-motion';
// // import { 
// //   FileSignature, Shield, Users, Zap, ArrowRight, 
// //   CheckCircle2, Clock, Lock, Mail, Smartphone
// // } from 'lucide-react';

// // const features = [
// //   { icon: Users, title: 'Multi-Party Signing', desc: 'Add unlimited signers in any order with color-coded field assignments' },
// //   { icon: Zap, title: 'Sequential Workflow', desc: 'Automatic email chain — each signer gets notified only when it\'s their turn' },
// //   { icon: Shield, title: 'Secure & Auditable', desc: 'Every action is logged with timestamps for complete audit trails' },
// //   { icon: Smartphone, title: 'Mobile Optimized', desc: 'Signers can review and sign documents from any device, anywhere' },
// //   { icon: Lock, title: 'Unique Secure Links', desc: 'Each signer receives a private, one-time-use link to their signing session' },
// //   { icon: Mail, title: 'Auto Completion', desc: 'All parties receive the final signed document automatically via email' },
// // ];

// // const steps = [
// //   { num: '01', title: 'Upload PDF', desc: 'Upload your document and add signing parties in order' },
// //   { num: '02', title: 'Place Fields', desc: 'Drag signature and text fields onto the document for each party' },
// //   { num: '03', title: 'Send & Track', desc: 'Signers are notified sequentially — track progress in real time' },
// // ];

// // export default function Landing() {
// //   const [isAuth, setIsAuth] = useState(false);

// //   useEffect(() => {
// //     base44.auth.isAuthenticated().then(setIsAuth);
// //   }, []);

// //   return (
// //     <div className="bg-slate-50 dark:bg-slate-950">
// //       {/* Hero */}
// //       <section className="relative overflow-hidden">
// //         <div className="absolute inset-0">
// //           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sky-400/10 rounded-full blur-[120px]" />
// //           <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[80px]" />
// //         </div>
        
// //         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
// //           <motion.div
// //             initial={{ opacity: 0, y: 30 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ duration: 0.7 }}
// //             className="text-center max-w-4xl mx-auto"
// //           >
// //             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 text-sm font-medium mb-8">
// //               <Zap className="w-4 h-4" />
// //               Sequential Multi-Party E-Signatures
// //             </div>
            
// //             <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
// //               Sign documents
// //               <span className="block bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
// //                 in perfect order
// //               </span>
// //             </h1>
            
// //             <p className="mt-8 text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
// //               Nexsign orchestrates multi-party signing workflows with precision. 
// //               Upload, assign fields, and let the sequential engine handle the rest.
// //             </p>

// //             <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
// //               {isAuth ? (
// //                 <Link to={createPageUrl('Dashboard')}>
// //                   <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-8 h-14 text-lg shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all">
// //                     Go to Dashboard
// //                     <ArrowRight className="ml-2 w-5 h-5" />
// //                   </Button>
// //                 </Link>
// //               ) : (
// //                 <>
// //                   <Button 
// //                     size="lg" 
// //                     onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
// //                     className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-8 h-14 text-lg shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
// //                   >
// //                     Get Started Free
// //                     <ArrowRight className="ml-2 w-5 h-5" />
// //                   </Button>
// //                   <Button 
// //                     size="lg" 
// //                     variant="outline" 
// //                     className="rounded-2xl px-8 h-14 text-lg border-slate-300 dark:border-slate-600"
// //                     onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
// //                   >
// //                     See How It Works
// //                   </Button>
// //                 </>
// //               )}
// //             </div>
// //           </motion.div>

// //           {/* Hero visual */}
// //           <motion.div
// //             initial={{ opacity: 0, y: 50 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ duration: 0.8, delay: 0.3 }}
// //             className="mt-20 max-w-4xl mx-auto"
// //           >
// //             <div className="relative rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-sky-500/10 p-8">
// //               <div className="flex items-center gap-3 mb-6">
// //                 <div className="flex gap-1.5">
// //                   <div className="w-3 h-3 rounded-full bg-red-400" />
// //                   <div className="w-3 h-3 rounded-full bg-yellow-400" />
// //                   <div className="w-3 h-3 rounded-full bg-green-400" />
// //                 </div>
// //                 <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
// //               </div>
              
// //               <div className="grid grid-cols-3 gap-4">
// //                 {['Signer 1 — Signed', 'Signer 2 — In Progress', 'Signer 3 — Waiting'].map((label, i) => (
// //                   <div key={i} className={`p-4 rounded-2xl border-2 ${
// //                     i === 0 ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' :
// //                     i === 1 ? 'border-sky-300 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-700' :
// //                     'border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-600'
// //                   }`}>
// //                     <div className="flex items-center gap-2 mb-2">
// //                       {i === 0 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
// //                        i === 1 ? <Clock className="w-5 h-5 text-sky-500 animate-pulse" /> :
// //                        <Clock className="w-5 h-5 text-slate-400" />}
// //                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
// //                     </div>
// //                     <div className="space-y-2">
// //                       <div className={`h-2 rounded-full ${i === 0 ? 'bg-green-300' : i === 1 ? 'bg-sky-300' : 'bg-slate-200 dark:bg-slate-600'}`} style={{ width: i === 0 ? '100%' : i === 1 ? '60%' : '0%' }} />
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* How it works */}
// //       <section className="py-24 bg-white dark:bg-slate-900/50">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="text-center mb-16">
// //             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">How it works</h2>
// //             <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Three simple steps to get your documents signed</p>
// //           </div>
          
// //           <div className="grid md:grid-cols-3 gap-8">
// //             {steps.map((step, i) => (
// //               <motion.div
// //                 key={i}
// //                 initial={{ opacity: 0, y: 20 }}
// //                 whileInView={{ opacity: 1, y: 0 }}
// //                 viewport={{ once: true }}
// //                 transition={{ delay: i * 0.15 }}
// //                 className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
// //               >
// //                 <div className="text-5xl font-extrabold text-sky-500/20 dark:text-sky-400/10 mb-4">{step.num}</div>
// //                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
// //                 <p className="text-slate-500 dark:text-slate-400">{step.desc}</p>
// //               </motion.div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* Features */}
// //       <section id="features" className="py-24">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="text-center mb-16">
// //             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Built for professionals</h2>
// //             <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Everything you need for seamless document signing</p>
// //           </div>
          
// //           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //             {features.map((f, i) => (
// //               <motion.div
// //                 key={i}
// //                 initial={{ opacity: 0, y: 20 }}
// //                 whileInView={{ opacity: 1, y: 0 }}
// //                 viewport={{ once: true }}
// //                 transition={{ delay: i * 0.1 }}
// //                 className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors group"
// //               >
// //                 <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-4 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
// //                   <f.icon className="w-6 h-6 text-sky-500" />
// //                 </div>
// //                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
// //                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
// //               </motion.div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* CTA */}
// //       <section className="py-24">
// //         <div className="max-w-4xl mx-auto px-4 text-center">
// //           <div className="p-12 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-600 relative overflow-hidden">
// //             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
// //             <div className="relative">
// //               <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to streamline your signing?</h2>
// //               <p className="text-sky-100 text-lg mb-8">Start sending documents for signature in minutes.</p>
// //               {isAuth ? (
// //                 <Link to={createPageUrl('Dashboard')}>
// //                   <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 rounded-2xl px-8 h-14 text-lg">
// //                     Open Dashboard <ArrowRight className="ml-2 w-5 h-5" />
// //                   </Button>
// //                 </Link>
// //               ) : (
// //                 <Button 
// //                   size="lg" 
// //                   onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
// //                   className="bg-white text-sky-600 hover:bg-sky-50 rounded-2xl px-8 h-14 text-lg"
// //                 >
// //                   Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
// //                 </Button>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
// //         <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
// //           <div className="flex items-center gap-2">
// //             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
// //               <FileSignature className="w-4 h-4 text-white" />
// //             </div>
// //             <span className="font-semibold text-slate-600 dark:text-slate-400">Nexsign</span>
// //           </div>
// //           <p className="text-sm text-slate-400">© 2026 Nexsign. All rights reserved.</p>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }



// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { useAuth } from '@/lib/AuthContext'; // আপনার লোকাল অথ ব্যবহার করা হয়েছে

// import { Button } from '@/components/ui/button';
// import { motion } from 'framer-motion';
// import { 
//   FileSignature, Shield, Users, Zap, ArrowRight, 
//   CheckCircle2, Clock, Lock, Mail, Smartphone
// } from 'lucide-react';

// const features = [
//   { icon: Users, title: 'Multi-Party Signing', desc: 'Add unlimited signers in any order with color-coded field assignments' },
//   { icon: Zap, title: 'Sequential Workflow', desc: 'Automatic email chain — each signer gets notified only when it\'s their turn' },
//   { icon: Shield, title: 'Secure & Auditable', desc: 'Every action is logged with timestamps for complete audit trails' },
//   { icon: Smartphone, title: 'Mobile Optimized', desc: 'Signers can review and sign documents from any device, anywhere' },
//   { icon: Lock, title: 'Unique Secure Links', desc: 'Each signer receives a private, one-time-use link to their signing session' },
//   { icon: Mail, title: 'Auto Completion', desc: 'All parties receive the final signed document automatically via email' },
// ];

// const steps = [
//   { num: '01', title: 'Upload PDF', desc: 'Upload your document and add signing parties in order' },
//   { num: '02', title: 'Place Fields', desc: 'Drag signature and text fields onto the document for each party' },
//   { num: '03', title: 'Send & Track', desc: 'Signers are notified sequentially — track progress in real time' },
// ];

// export default function Landing() {
//   const navigate = useNavigate();
//   // আপনার লোকাল অথ লজিক
//   const { user } = useAuth() || {}; 
//   const isAuth = !!user;

//   const handleStart = () => {
//     if (isAuth) {
//       navigate(createPageUrl('Dashboard'));
//     } else {
//       // আপনার নিজের লগইন পেজ না আসা পর্যন্ত সরাসরি ড্যাশবোর্ডে পাঠানোর ব্যবস্থা
//       navigate(createPageUrl('Dashboard')); 
//     }
//   };

//   return (
//     <div className="bg-slate-50 dark:bg-slate-950">
//       {/* Hero */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sky-400/10 rounded-full blur-[120px]" />
//           <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[80px]" />
//         </div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7 }}
//             className="text-center max-w-4xl mx-auto"
//           >
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 text-sm font-medium mb-8">
//               <Zap className="w-4 h-4" />
//               Sequential Multi-Party E-Signatures
//             </div>
            
//             <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
//               Sign documents
//               <span className="block bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
//                 in perfect order
//               </span>
//             </h1>
            
//             <p className="mt-8 text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
//               Nexsign orchestrates multi-party signing workflows with precision. 
//               Upload, assign fields, and let the sequential engine handle the rest.
//             </p>

//             <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
//               {isAuth ? (
//                 <Link to={createPageUrl('Dashboard')}>
//                   <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-8 h-14 text-lg shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all">
//                     Go to Dashboard
//                     <ArrowRight className="ml-2 w-5 h-5" />
//                   </Button>
//                 </Link>
//               ) : (
//                 <>
//                   <Button 
//                     size="lg" 
//                     onClick={handleStart} 
//                     className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-8 h-14 text-lg shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
//                   >
//                     Get Started Free
//                     <ArrowRight className="ml-2 w-5 h-5" />
//                   </Button>
//                   <Button 
//                     size="lg" 
//                     variant="outline" 
//                     className="rounded-2xl px-8 h-14 text-lg border-slate-300 dark:border-slate-600"
//                     onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
//                   >
//                     See How It Works
//                   </Button>
//                 </>
//               )}
//             </div>
//           </motion.div>

//           {/* Hero visual */}
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//             className="mt-20 max-w-4xl mx-auto"
//           >
//             <div className="relative rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-sky-500/10 p-8">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="flex gap-1.5">
//                   <div className="w-3 h-3 rounded-full bg-red-400" />
//                   <div className="w-3 h-3 rounded-full bg-yellow-400" />
//                   <div className="w-3 h-3 rounded-full bg-green-400" />
//                 </div>
//                 <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
//               </div>
              
//               <div className="grid grid-cols-3 gap-4">
//                 {['Signer 1 — Signed', 'Signer 2 — In Progress', 'Signer 3 — Waiting'].map((label, i) => (
//                   <div key={i} className={`p-4 rounded-2xl border-2 ${
//                     i === 0 ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' :
//                     i === 1 ? 'border-sky-300 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-700' :
//                     'border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-600'
//                   }`}>
//                     <div className="flex items-center gap-2 mb-2">
//                       {i === 0 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
//                        i === 1 ? <Clock className="w-5 h-5 text-sky-500 animate-pulse" /> :
//                        <Clock className="w-5 h-5 text-slate-400" />}
//                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
//                     </div>
//                     <div className="space-y-2">
//                       <div className={`h-2 rounded-full ${i === 0 ? 'bg-green-300' : i === 1 ? 'bg-sky-300' : 'bg-slate-200 dark:bg-slate-600'}`} style={{ width: i === 0 ? '100%' : i === 1 ? '60%' : '0%' }} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* How it works */}
//       <section className="py-24 bg-white dark:bg-slate-900/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">How it works</h2>
//             <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Three simple steps to get your documents signed</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             {steps.map((step, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.15 }}
//                 className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
//               >
//                 <div className="text-5xl font-extrabold text-sky-500/20 dark:text-sky-400/10 mb-4">{step.num}</div>
//                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
//                 <p className="text-slate-500 dark:text-slate-400">{step.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section id="features" className="py-24">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Built for professionals</h2>
//             <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Everything you need for seamless document signing</p>
//           </div>
          
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((f, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors group"
//               >
//                 <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-4 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 transition-colors">
//                   <f.icon className="w-6 h-6 text-sky-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
//                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-24">
//         <div className="max-w-4xl mx-auto px-4 text-center">
//           <div className="p-12 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-600 relative overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
//             <div className="relative">
//               <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to streamline your signing?</h2>
//               <p className="text-sky-100 text-lg mb-8">Start sending documents for signature in minutes.</p>
//               <Button 
//                 size="lg" 
//                 onClick={handleStart} 
//                 className="bg-white text-sky-600 hover:bg-sky-50 rounded-2xl px-8 h-14 text-lg"
//               >
//                 {isAuth ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2 w-5 h-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
//         <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
//               <FileSignature className="w-4 h-4 text-white" />
//             </div>
//             <span className="font-semibold text-slate-600 dark:text-slate-400">Nexsign</span>
//           </div>
//           <p className="text-sm text-slate-400">© 2026 Nexsign. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FooterSection } from '@/components/FooterSection';

export function Landing({ onNavigate }) {
  return (
    /* bg-white সরিয়ে ডার্ক মোড সাপোর্ট যোগ করা হয়েছে */
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} />
      <main>
        <HeroSection onGetStarted={() => onNavigate('dashboard')} />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <FooterSection />
    </div>
  );
}
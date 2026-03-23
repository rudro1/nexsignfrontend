// import React from 'react';
// import { Mail, UserPlus } from 'lucide-react';

// const CCInput = ({ value, onChange }) => {
//   // টাইপিং স্মুথ রাখার জন্য লোকাল স্টেট
//   const [localText, setLocalText] = React.useState("");

//   // ডাটাবেস থেকে ডাটা লোড হলে বা বাইরে থেকে প্রপস আপডেট হলে ইনপুট সিঙ্ক হবে
//   React.useEffect(() => {
//     if (Array.isArray(value)) {
//       const joined = value.join(', ');
//       // কার্সার লাফানো বন্ধ করতে শুধু ডিফারেন্ট হলেই আপডেট হবে
//       if (joined !== localText.replace(/,\s*$/, '')) {
//         setLocalText(joined);
//       }
//     }
//   }, [value]);

//   const handleChange = (e) => {
//     const inputValue = e.target.value;
//     setLocalText(inputValue); // এটি কমা এবং স্পেস ইনপুটে ধরে রাখবে
    
//     // প্যারেন্ট কম্পোনেন্টে (DocumentEditor) ক্লিন অ্যারে পাঠানো
//     const emailArray = inputValue.split(',')
//       .map(email => email.trim())
//       .filter(email => email !== "");
      
//     onChange(emailArray);
//   };

//   return (
//     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
//       <div className="flex items-center gap-2 mb-3 text-[#28ABDF]">
//         <UserPlus size={18} />
//         <h3 className="font-bold text-xs uppercase tracking-wider">Carbon Copy (CC)</h3>
//       </div>
//       <div className="relative">
//         <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
//           <Mail size={16} />
//         </span>
//         <input
//           type="text"
//           placeholder="email1@example.com, email2@example.com"
//           className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28ABDF]/20 focus:border-[#28ABDF] sm:text-sm transition-all"
//           value={localText}
//           onChange={handleChange}
//         />
//       </div>
//       <p className="mt-2 text-[10px] text-gray-400 italic">
//         * Separate multiple email addresses with commas (,).
//       </p>
//     </div>
//   );
// };

// export default CCInput;

import React from 'react';
import { Mail, UserPlus } from 'lucide-react';

const CCInput = ({ value, onChange }) => {
  // ১. ইনপুট টাইপিং স্মুথ রাখার জন্য লোকাল স্টেট
  const [localText, setLocalText] = React.useState("");

  // ২. শুধুমাত্র মাউন্ট হওয়ার সময় বা ডাটাবেস থেকে ডাটা আসলে ইনপুট ফিল্ড পপুলেট হবে
  // টাইপিং এর সময় এই useEffect যাতে বাধা না দেয় সেজন্য check করা হয়েছে
  React.useEffect(() => {
    const joined = Array.isArray(value) ? value.join(', ') : "";
    // যদি ইনপুট ফিল্ড খালি থাকে অথবা বাইরে থেকে নতুন কোনো ডাটা আসে তখনই আপডেট হবে
    if (!localText && joined) {
      setLocalText(joined);
    }
  }, [value]); // localText এখানে dependency হিসেবে নেই, তাই টাইপিং এর সময় এটি ট্রিপ হবে না

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setLocalText(inputValue);
    
    // প্যারেন্ট কম্পোনেন্টে ক্লিন অ্যারে পাঠানো
    const emailArray = inputValue.split(',')
      .map(email => email.trim())
      .filter(email => {
        // ইমেইল ভ্যালিডেশন লজিক (ঐচ্ছিক কিন্তু স্কেলেবল কোডের জন্য ভালো)
        return email !== "" && /^\S+@\S+\.\S+$/.test(email);
      });
      
    onChange(emailArray);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center gap-2 mb-3 text-[#28ABDF]">
        <UserPlus size={18} />
        <h3 className="font-bold text-xs uppercase tracking-wider">Carbon Copy (CC)</h3>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Mail size={16} />
        </span>
        <input
          type="text"
          placeholder="email1@example.com, email2@example.com"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28ABDF]/20 focus:border-[#28ABDF] sm:text-sm transition-all"
          value={localText}
          onChange={handleChange}
        />
      </div>
      {/* ইউজারকে ফিডব্যাক দিতে একটি ছোট ব্যাজ এরিয়া যোগ করতে পারেন ভবিষ্যতে */}
      <p className="mt-2 text-[10px] text-gray-400 italic">
        * Separate multiple email addresses with commas (,).
      </p>
    </div>
  );
};

export default React.memo(CCInput);
import React from 'react';
import { Mail, UserPlus } from 'lucide-react';

const CCInput = ({ value, onChange }) => {
  // ১. অ্যারে থাকলে সেটিকে কমা দিয়ে জয়েন করে স্ট্রিং হিসেবে দেখানো
  const displayValue = Array.isArray(value) ? value.join(', ') : (value || "");

  const handleChange = (e) => {
  const inputValue = e.target.value;
  
  // কমা দিয়ে স্প্লিট করা, স্পেস ট্রিম করা এবং খালি ভ্যালুগুলো বাদ দেওয়া
  const emailArray = inputValue.split(',')
    .map(email => email.trim())
    .filter(email => email !== ""); // এটি নিশ্চিত করবে কোনো ফাঁকা ইমেইল যাবে না
    
  onChange(emailArray);
};

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center gap-2 mb-3 text-[#28ABDF]">
        <UserPlus size={18} />
        <h3 className="font-bold text-xs uppercase tracking-wider">Carbon Copy (CC)</h3>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Mail size={16} />
        </span>
        <input
          type="text" // 'email' এর বদলে 'text' দিতে হবে যাতে কমা সাপোর্ট করে
          placeholder="email1@example.com, email2@example.com"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28ABDF]/20 focus:border-[#28ABDF] sm:text-sm transition-all"
          value={displayValue}
          onChange={handleChange}
        />
      </div>
      <p className="mt-2 text-[10px] text-gray-400 italic">
        * Separate multiple email addresses with commas (,).
      </p>
    </div>
  );
};

export default CCInput;
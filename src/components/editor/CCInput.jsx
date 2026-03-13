import React from 'react';
import { Mail, UserPlus } from 'lucide-react'; // আইকনের জন্য লুব্রেরি না থাকলে সাধারণ টেক্সট দিন

const CCInput = ({ value, onChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
      <div className="flex items-center gap-2 mb-3 text-blue-600">
        <UserPlus size={18} />
        <h3 className="font-semibold text-sm uppercase tracking-wider">Carbon Copy (CC)</h3>
      </div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Mail size={16} />
        </span>
        <input
          type="email"
          placeholder="Enter CC email address"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="mt-2 text-[10px] text-gray-500 italic">
        * This person will receive a copy of the final signed document.
      </p>
    </div>
  );
};

export default CCInput;
import React from 'react';
import { FileSignature } from 'lucide-react';

// ফাংশনের নাম বড় হাতের Logo করা ভালো প্র্যাকটিস
export const Logo = () => {
    return (
        <>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Nexsign
            </span>
        </>
    );
};

export default Logo;
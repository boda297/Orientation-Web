import React from 'react';
import { Play } from 'lucide-react';

export default function Logo() {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="relative flex items-center justify-center w-10 h-10 bg-[#ea0000] rounded-full mr-1">
                <Play className="w-5 h-5 text-black ml-1 fill-black" strokeWidth={0} />
            </div>
            <span className="text-[#ea0000] text-3xl font-extrabold tracking-tight">rientation</span>
        </div>
    );
}

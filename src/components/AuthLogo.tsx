import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLogo() {
    return (
        <Link href="/" className="flex items-center justify-center mb-6 group select-none">
            <div className="inline-flex items-center">
                <Image
                    src="/assets/logo/logo.png"
                    alt="Orientation Logo"
                    width={44}
                    height={44}
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain mr-0.5 transition-transform duration-200 group-hover:scale-105"
                    priority
                />
                <span className="text-white text-3xl sm:text-4xl font-black tracking-tight">
                    rientation
                </span>
            </div>
        </Link>
    );
}

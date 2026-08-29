export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white relative py-10 px-4 items-center justify-center overflow-y-auto">
            {/* Abstract dark red diagonal elements fixed in background */}
            <div className="fixed top-0 left-[-5%] w-[80%] h-32 bg-[#4a0000] rotate-[-25deg] origin-top-left opacity-30 blur-[2px] pointer-events-none"></div>
            <div className="fixed top-[10%] left-[-10%] w-[100%] h-40 bg-[#300000] rotate-[-25deg] origin-top-left opacity-30 blur-[2px] pointer-events-none"></div>
            
            {/* Auth Form Card */}
            <div className="relative z-[10] w-full max-w-md p-6 sm:p-8 md:p-10 my-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                {children}
            </div>
        </div>
    );
}

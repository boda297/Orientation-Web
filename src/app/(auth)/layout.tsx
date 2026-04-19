export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden items-center justify-center">
            {/* Abstract dark red diagonal elements mimicking the design */}
            <div className="absolute top-0 left-[-5%] w-[80%] h-32 bg-[#4a0000] rotate-[-25deg] origin-top-left opacity-30 blur-[2px]"></div>
            <div className="absolute top-[10%] left-[-10%] w-[100%] h-40 bg-[#300000] rotate-[-25deg] origin-top-left opacity-30 blur-[2px]"></div>
            <div className="absolute z-[10] w-full max-w-md p-8 md:p-12 md:bg-black/40 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-3xl shadow-2xl">
                {children}
            </div>
        </div>
    );
}

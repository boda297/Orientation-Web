'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, PlusSquare, LayoutDashboard, ChevronLeft, Users } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = () => {
            const token = getAccessToken();
            if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
                router.push('/');
                return;
            }
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'ADMIN' || payload.role === 'admin' || payload.role === 'superadmin') {
                    setIsAdmin(true);
                    setUserRole(payload.role.toLowerCase());
                } else {
                    router.push('/');
                }
            } catch (e) {
                console.error('Token decode error', e);
                router.push('/');
            }
        };
        checkAdmin();
    }, [router]);

    useEffect(() => {
        if (userRole && userRole !== 'superadmin' && pathname.startsWith('/dashboard/users')) {
            router.push('/dashboard');
        }
    }, [userRole, pathname, router]);

    if (isAdmin === null) {
        return <div className="min-h-screen bg-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
    }

    const navLinks = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        {
            href: '/dashboard/users', label: 'Users', icon: Users,
            subLinks: [
                { href: '/dashboard/users/create', label: 'Create User' },
                { href: '/dashboard/users', label: 'Registered Users' }
            ]
        },
        {
            href: '/dashboard/developer', label: 'Developers', icon: Building2,
            subLinks: [
                { href: '/dashboard/developer/create', label: 'Create Developer' },
                { href: '/dashboard/developer', label: 'Registered Developers' }
            ]
        },
        {
            href: '/dashboard/project', label: 'Projects', icon: PlusSquare,
            subLinks: [
                { href: '/dashboard/project/create', label: 'Create Project' },
                { href: '/dashboard/project', label: 'Registered Projects' }
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-[#111] border-r border-zinc-800 flex-shrink-0">
                <div className="p-6">
                    <Link href="/" className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to site
                    </Link>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                        Admin Panel
                    </h2>
                </div>

                <nav className="flex flex-col gap-2 px-4 pb-6">
                    {navLinks.map((link) => {
                        if (link.label === 'Users' && userRole !== 'superadmin') {
                            return null;
                        }

                        // For exact overview match, or starts with for sections
                        const isActive = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href);
                        const Icon = link.icon;
                        return (
                            <div key={link.label} className="flex flex-col gap-1">
                                <Link
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-red-600/10 text-red-500 font-bold border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.05)]'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-800/80 border border-transparent'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>

                                {link.subLinks && (
                                    <div className="ml-6 flex flex-col gap-1 mt-1 border-l-2 border-zinc-800 pl-3">
                                        {link.subLinks.map(sub => {
                                            const isSubActive = pathname === sub.href;
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    className={`py-2 px-3 rounded-lg text-sm transition-all flex items-center gap-2 ${isSubActive
                                                            ? 'text-white bg-zinc-800/80 font-medium'
                                                            : 'text-gray-500 hover:text-gray-300 hover:bg-zinc-800/40'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-red-500' : 'bg-transparent'}`} />
                                                    {sub.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 overflow-auto bg-[#0a0a0a]">
                {children}
            </main>
        </div>
    );
}

'use client';

export default function DashboardOverview() {
    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Users</h2>
                        <p className="text-gray-400 mt-2 text-sm">Create and manage admin, normal, and super users.</p>
                    </div>
                    <div className="mt-6 flex flex-col xl:flex-row gap-3">
                        <a href="/dashboard/users/create" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Create User
                        </a>
                        <a href="/dashboard/users" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Registered Users
                        </a>
                    </div>
                </div>
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Developers</h2>
                        <p className="text-gray-400 mt-2 text-sm">Create and manage real estate developers.</p>
                    </div>
                    <div className="mt-6 flex flex-col xl:flex-row gap-3">
                        <a href="/dashboard/developer/create" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Create Developer
                        </a>
                        <a href="/dashboard/developer" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Registered Developers
                        </a>
                    </div>
                </div>
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Projects</h2>
                        <p className="text-gray-400 mt-2 text-sm">Create and manage real estate projects, upload media, and more.</p>
                    </div>
                    <div className="mt-6 flex flex-col xl:flex-row gap-3">
                        <a href="/dashboard/project/create" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Create Project
                        </a>
                        <a href="/dashboard/project" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-center font-medium transition-colors text-sm whitespace-nowrap">
                            Registered Projects
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

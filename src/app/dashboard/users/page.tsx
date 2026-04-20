'use client';

import { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usersApi, type User } from '@/lib/dashboardApi';

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        usersApi.list()
            .then(setUsers)
            .catch((err) => setError(err.message || 'Failed to load users'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await usersApi.delete(id);
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete user');
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="w-8 h-8 text-red-500" />
                    Registered Users
                </h1>
                <Link
                    href="/dashboard/users/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create User
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                            <span>Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u, idx) => (
                                    <tr key={u._id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{u.username}</td>
                                        <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    u.role === 'superadmin'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : u.role === 'admin'
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                                                }`}
                                            >
                                                {(u.role || 'user').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

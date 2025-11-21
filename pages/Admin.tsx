import React, { useState, useEffect } from 'react';
import { User, Post, UserRole } from '../types';
import { authService, postService } from '../services/storage';
import { Trash2, Coins, ShieldCheck, AlertTriangle, RefreshCcw } from 'lucide-react';

interface AdminProps {
    user: User;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
    const [giftAmount, setGiftAmount] = useState<number>(1000);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const users = await authService.getAllUsers();
        const posts = await postService.getPosts();
        setAllUsers(users);
        setAllPosts(posts);
    };

    const handleDeletePost = async (postId: string) => {
        if (window.confirm('Are you sure you want to DELETE this post? This cannot be undone.')) {
            await postService.deletePost(postId);
            loadData();
        }
    };

    const handleGiftCoins = async (userId: string) => {
        if (window.confirm(`Gift ${giftAmount} RC to this user?`)) {
            await authService.adminGiveCoins(userId, giftAmount);
            loadData();
        }
    };

    if (user.role !== UserRole.ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-red-500">
                <AlertTriangle size={64} className="mb-4" />
                <h1 className="text-3xl font-bold">ACCESS DENIED</h1>
                <p className="text-gray-400">You are not authorized to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-900 to-black p-6 rounded-xl border border-red-800 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white flex items-center">
                        <ShieldCheck className="mr-3" size={40} />
                        RCN Command Center
                    </h1>
                    <p className="text-red-200 mt-2">Welcome back, Administrator {user.username}. You have full control.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none"></div>
            </div>

            <div className="flex space-x-4 border-b border-white/10 pb-4">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'users' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    User Management
                </button>
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    Post Moderation
                </button>
                <button onClick={loadData} className="ml-auto text-gray-400 hover:text-white">
                    <RefreshCcw size={20} />
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Balance (RC)</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/5">
                                    <td className="p-4 flex items-center space-x-3">
                                        <img src={u.avatarUrl} className="w-8 h-8 rounded bg-black" alt="" />
                                        <div>
                                            <div className="font-bold text-white">{u.username}</div>
                                            <div className="text-xs text-gray-500">ID: {u.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === UserRole.ADMIN ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-gray-300'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-discord-gold">
                                        {u.coins.toLocaleString()}
                                    </td>
                                    <td className="p-4 flex justify-end items-center space-x-2">
                                        <div className="flex items-center space-x-2 bg-black/30 p-1 rounded">
                                            <input 
                                                type="number" 
                                                value={giftAmount} 
                                                onChange={e => setGiftAmount(parseInt(e.target.value))}
                                                className="w-20 bg-transparent text-right text-xs text-white focus:outline-none"
                                            />
                                            <button 
                                                onClick={() => handleGiftCoins(u.id)}
                                                className="p-1.5 bg-discord-green hover:bg-green-600 text-white rounded"
                                                title="Gift Coins"
                                            >
                                                <Coins size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'posts' && (
                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">Post Details</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Stats</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allPosts.map(p => (
                                <tr key={p.id} className="hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{p.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{p.content}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {p.authorName}
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        Likes: {p.likes}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDeletePost(p.id)}
                                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded transition-colors flex items-center ml-auto space-x-2"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {allPosts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No active posts.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;
